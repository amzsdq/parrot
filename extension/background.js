importScripts('route-state.js', 'route-queue.js');

const ROUTE_QUEUE_KEY = 'parrotRouteQueue';
const TARGETS_KEY = 'parrotTargets';
const EVENTS_KEY = 'parrotEvents';
const ROUTE_ALARM = 'parrot-route-queue';
const ROUTE_PERIOD_MINUTES = 1;
const MAX_ROUTE_RECORDS = 300;
const MAX_EVENTS = 500;

const loadQueue = async () => { const data = await chrome.storage.local.get(ROUTE_QUEUE_KEY); return Array.isArray(data[ROUTE_QUEUE_KEY]) ? data[ROUTE_QUEUE_KEY] : []; };
const saveQueue = async (queue) => chrome.storage.local.set({ [ROUTE_QUEUE_KEY]: queue });
async function loadTargets() { const data = await chrome.storage.local.get(TARGETS_KEY); return Array.isArray(data[TARGETS_KEY]) ? data[TARGETS_KEY] : []; }
async function findTarget(routeId) { return (await loadTargets()).find((target) => target.id === routeId || target.routeKey === routeId || target.workerLabel === routeId) || null; }
async function appendEvent(event) { const data = await chrome.storage.local.get(EVENTS_KEY); const events = Array.isArray(data[EVENTS_KEY]) ? data[EVENTS_KEY] : []; await chrome.storage.local.set({ [EVENTS_KEY]: [...events, event].slice(-MAX_EVENTS) }); }

function parseSignal(raw) {
  try {
    const url = new URL(raw);
    if (url.origin !== 'https://parrot.invalid') return null;
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    if (parts[0] === 'complete' && parts.length === 2) return { kind: 'complete', runId: parts[1], signalId: `complete:${parts[1]}` };
    if ((parts[0] === 'wake' || parts[0] === 'message') && parts.length === 3) {
      const to = String(url.searchParams.get('to') || '');
      if (!to) return null;
      return { kind: parts[0], sourceRunId: parts[1], eventId: parts[2], to, ref: String(url.searchParams.get('ref') || ''), signalId: `${parts[0]}:${parts[1]}:${parts[2]}` };
    }
  } catch {}
  return null;
}
function applyTemplate(template, values) { return String(template || '').replace(/\{\{([A-Z_]+)\}\}/g, (_m, key) => values[key] ?? ''); }

async function handleSignal(href, sourceUrl) {
  const signal = parseSignal(href);
  if (!signal) return { ok: false, reason: 'invalid_signal' };
  const queue = await loadQueue();
  const eventsData = await chrome.storage.local.get(EVENTS_KEY);
  const events = Array.isArray(eventsData[EVENTS_KEY]) ? eventsData[EVENTS_KEY] : [];
  if (queue.some((item) => item.signalId === signal.signalId) || events.some((event) => event.signalId === signal.signalId)) return { ok: true, deduped: true };

  if (signal.kind === 'complete') {
    const targets = await loadTargets();
    const index = targets.findIndex((target) => target.runId === signal.runId);
    if (index >= 0) { targets[index] = { ...targets[index], status: 'completed', completedAt: Date.now(), completionSeenSignal: href, completionSignalType: 'link' }; await chrome.storage.local.set({ [TARGETS_KEY]: targets }); }
    await appendEvent({ type: 'COMPLETE', signalId: signal.signalId, runId: signal.runId, at: Date.now(), sourceUrl });
    return { ok: true, matchedTarget: index >= 0 };
  }

  const target = await findTarget(signal.to);
  if (!target) return { ok: false, reason: 'target_not_found' };
  const payload = signal.kind === 'wake'
    ? String(target.wakePrompt || '계속 작업하세요.')
    : applyTemplate(target.messageTemplate || '[앵무새 | {{FROM}} → {{TO}}]\n\nSOURCE: {{SOURCE_URL}}\n\n{{MESSAGE}}', { FROM: signal.sourceRunId, TO: signal.to, SOURCE_URL: sourceUrl || '', MESSAGE: signal.ref ? `REFERENCE: ${signal.ref}` : '' });
  const item = { queueId: crypto.randomUUID(), signalId: signal.signalId, type: signal.kind.toUpperCase(), from: signal.sourceRunId, targetRouteId: signal.to, sourceUrl: sourceUrl || '', reference: signal.ref || '', payload, status: 'pending', createdAt: Date.now() };
  await saveQueue(ParrotRouteState.pruneRouteRecords([...queue, item], MAX_ROUTE_RECORDS));
  await appendEvent({ type: item.type, signalId: signal.signalId, queueId: item.queueId, from: item.from, to: item.targetRouteId, at: item.createdAt });
  queueApi.processEligible().catch(() => {});
  return { ok: true, queueId: item.queueId };
}

async function dispatchRouteItem(item) {
  if (!ParrotRouteState.canAutoDispatch(item)) return { ok: false, skipped: true, reason: 'not_pending' };
  const target = await findTarget(item.targetRouteId || item.to);
  if (!target?.url) return { ok: false, reason: 'target_not_found' };
  let origin; try { origin = new URL(target.url).origin; } catch { return { ok: false, reason: 'invalid_target_url' }; }
  const tabs = await chrome.tabs.query({ url: `${origin}/*` });
  const tab = tabs.find((candidate) => candidate.url === target.url) || tabs[0];
  if (!tab?.id) return { ok: false, reason: 'target_tab_not_open' };
  const structure = ParrotRouteState.classifyTabStructure(tab);
  if (structure.structuralState !== 'open') return { ok: false, reason: structure.structuralState, structure };
  try { const response = await chrome.tabs.sendMessage(tab.id, { type: 'PARROT_ROUTE_DELIVER', route: item }); return response?.ok ? { ok: true, response } : { ok: false, reason: response?.reason || 'content_rejected', response }; }
  catch (error) { return { ok: false, reason: 'content_unreachable', error: String(error?.message || error) }; }
}

const queueApi = ParrotRouteQueue.createRouteQueueApi({ load: loadQueue, save: saveQueue, dispatch: dispatchRouteItem, maxRecords: MAX_ROUTE_RECORDS });
async function ensureAlarm() { const existing = await chrome.alarms.get(ROUTE_ALARM); if (!existing) await chrome.alarms.create(ROUTE_ALARM, { periodInMinutes: ROUTE_PERIOD_MINUTES }); }
chrome.runtime.onInstalled.addListener(() => { ensureAlarm(); }); chrome.runtime.onStartup.addListener(() => { ensureAlarm(); }); ensureAlarm();
chrome.alarms.onAlarm.addListener((alarm) => { if (alarm.name === ROUTE_ALARM) queueApi.processEligible().catch(() => {}); });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const run = async () => {
    switch (message?.type) {
      case 'PARROT_SIGNAL_DISCOVERED': return handleSignal(message.href, message.sourceUrl || sender?.tab?.url || '');
      case 'PARROT_ROUTE_AMBIGUOUS': { const result = await queueApi.reconcileAmbiguity(message.receipt); return { ...result, ack: result.ok === true, queueId: message.receipt?.queueId || '' }; }
      case 'PARROT_ROUTE_DELIVERED': { const item = await queueApi.recordDelivered(message.queueId, message.receipt || {}); return { ok: Boolean(item), ack: Boolean(item), item }; }
      case 'PARROT_ROUTE_RETRY': return queueApi.manualRetry(message.queueId);
      case 'PARROT_ROUTE_RESOLVE': return queueApi.manualResolve(message.queueId);
      case 'PARROT_ROUTE_PROCESS': return { ok: true, results: await queueApi.processEligible() };
      case 'PARROT_TAB_STRUCTURE': return { ok: true, structure: ParrotRouteState.classifyTabStructure(sender?.tab) };
      default: return null;
    }
  };
  if (message?.type !== 'PARROT_SIGNAL_DISCOVERED' && !message?.type?.startsWith?.('PARROT_ROUTE_') && message?.type !== 'PARROT_TAB_STRUCTURE') return false;
  run().then((result) => sendResponse(result)).catch((error) => sendResponse({ ok: false, reason: 'background_error', error: String(error?.message || error) })); return true;
});
