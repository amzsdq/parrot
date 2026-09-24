importScripts('route-state.js', 'route-queue.js');

const ROUTE_QUEUE_KEY = 'parrotRouteQueue';
const TARGETS_KEY = 'parrotTargets';
const ROUTE_ALARM = 'parrot-route-queue';
const ROUTE_PERIOD_MINUTES = 1;
const MAX_ROUTE_RECORDS = 300;

const loadQueue = async () => {
  const data = await chrome.storage.local.get(ROUTE_QUEUE_KEY);
  return Array.isArray(data[ROUTE_QUEUE_KEY]) ? data[ROUTE_QUEUE_KEY] : [];
};
const saveQueue = async (queue) => chrome.storage.local.set({ [ROUTE_QUEUE_KEY]: queue });

async function findTarget(routeId) {
  const data = await chrome.storage.local.get(TARGETS_KEY);
  const targets = Array.isArray(data[TARGETS_KEY]) ? data[TARGETS_KEY] : [];
  return targets.find((target) => target.id === routeId || target.routeKey === routeId || target.workerLabel === routeId) || null;
}

async function dispatchRouteItem(item) {
  if (!ParrotRouteState.canAutoDispatch(item)) return { ok: false, skipped: true, reason: 'not_pending' };
  const target = await findTarget(item.targetRouteId || item.to);
  if (!target?.url) return { ok: false, reason: 'target_not_found' };
  const tabs = await chrome.tabs.query({ url: `${new URL(target.url).origin}/*` });
  const tab = tabs.find((candidate) => candidate.url === target.url) || tabs[0];
  if (!tab?.id) return { ok: false, reason: 'target_tab_not_open' };
  const structure = ParrotRouteState.classifyTabStructure(tab);
  if (structure.structuralState !== 'open') return { ok: false, reason: structure.structuralState, structure };
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'PARROT_ROUTE_DELIVER', route: item });
    return response?.ok ? { ok: true, response } : { ok: false, reason: response?.reason || 'content_rejected', response };
  } catch (error) {
    return { ok: false, reason: 'content_unreachable', error: String(error?.message || error) };
  }
}

const queueApi = ParrotRouteQueue.createRouteQueueApi({
  load: loadQueue,
  save: saveQueue,
  dispatch: dispatchRouteItem,
  maxRecords: MAX_ROUTE_RECORDS
});

async function ensureAlarm() {
  const existing = await chrome.alarms.get(ROUTE_ALARM);
  if (!existing) await chrome.alarms.create(ROUTE_ALARM, { periodInMinutes: ROUTE_PERIOD_MINUTES });
}

chrome.runtime.onInstalled.addListener(() => { ensureAlarm(); });
chrome.runtime.onStartup.addListener(() => { ensureAlarm(); });
ensureAlarm();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ROUTE_ALARM) queueApi.processEligible().catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const run = async () => {
    switch (message?.type) {
      case 'PARROT_ROUTE_AMBIGUOUS': {
        const result = await queueApi.reconcileAmbiguity(message.receipt);
        return { ...result, ack: result.ok === true, queueId: message.receipt?.queueId || '' };
      }
      case 'PARROT_ROUTE_DELIVERED': {
        const item = await queueApi.recordDelivered(message.queueId, message.receipt || {});
        return { ok: Boolean(item), ack: Boolean(item), item };
      }
      case 'PARROT_ROUTE_RETRY':
        return queueApi.manualRetry(message.queueId);
      case 'PARROT_ROUTE_RESOLVE':
        return queueApi.manualResolve(message.queueId);
      case 'PARROT_ROUTE_PROCESS':
        return { ok: true, results: await queueApi.processEligible() };
      case 'PARROT_TAB_STRUCTURE':
        return { ok: true, structure: ParrotRouteState.classifyTabStructure(sender?.tab) };
      default:
        return null;
    }
  };
  if (!message?.type?.startsWith?.('PARROT_ROUTE_') && message?.type !== 'PARROT_TAB_STRUCTURE') return false;
  run().then((result) => sendResponse(result)).catch((error) => sendResponse({ ok: false, reason: 'background_error', error: String(error?.message || error) }));
  return true;
});
