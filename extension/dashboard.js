const TARGETS_KEY = 'parrotTargets';
const ROUTE_QUEUE_KEY = 'parrotRouteQueue';
const EVENTS_KEY = 'parrotEvents';
const $ = (id) => document.getElementById(id);
let workers = [];
let routes = [];
let page = 0;

init();
async function init() {
  $('refresh').addEventListener('click', refresh);
  $('newTarget').addEventListener('click', () => chrome.runtime.openOptionsPage?.());
  $('searchWorkers').addEventListener('input', () => { page = 0; renderWorkers(); });
  $('filterWorkers').addEventListener('change', () => { page = 0; renderWorkers(); });
  $('workerPageSize').addEventListener('change', () => { page = 0; renderWorkers(); });
  $('workerPrev').addEventListener('click', () => { page = Math.max(0, page - 1); renderWorkers(); });
  $('workerNext').addEventListener('click', () => { page += 1; renderWorkers(); });
  $('routingBody').addEventListener('click', routeAction);
  await refresh();
}

async function refresh() {
  const data = await chrome.storage.local.get([TARGETS_KEY, ROUTE_QUEUE_KEY, EVENTS_KEY]);
  routes = Array.isArray(data[ROUTE_QUEUE_KEY]) ? data[ROUTE_QUEUE_KEY] : [];
  const targets = Array.isArray(data[TARGETS_KEY]) ? data[TARGETS_KEY] : [];
  const tabs = await chrome.tabs.query({ url: 'https://chatgpt.com/*' });
  workers = targets.map((target) => {
    const tab = tabs.find((candidate) => candidate.url === target.url);
    const structure = ParrotRouteState.classifyTabStructure(tab);
    return { target, tab, structure };
  });
  renderStats(); renderWorkers(); renderRoutes(); renderEvents(data[EVENTS_KEY]);
}

function isAttention(worker) { return ['discarded','frozen'].includes(worker.structure.structuralState) || Boolean(worker.target.lastError); }
function renderStats() {
  $('statTargets').textContent = workers.length;
  $('statOpen').textContent = workers.filter((w) => w.tab).length;
  $('statRunning').textContent = workers.filter((w) => w.target.status === 'running').length;
  $('statAttention').textContent = workers.filter(isAttention).length + routes.filter((r) => r.status === 'ambiguous').length;
}
function filteredWorkers() {
  const q = $('searchWorkers').value.trim().toLowerCase();
  const filter = $('filterWorkers').value;
  return workers.filter((w) => {
    const hay = [w.target.workerLabel, w.target.title, w.target.routeKey, w.target.url].join(' ').toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (filter === 'open' && !w.tab) return false;
    if (filter === 'running' && w.target.status !== 'running') return false;
    if (filter === 'attention' && !isAttention(w)) return false;
    return true;
  });
}
function renderWorkers() {
  const list = filteredWorkers();
  const size = Number($('workerPageSize').value || 25);
  const pages = Math.max(1, Math.ceil(list.length / size)); page = Math.min(page, pages - 1);
  const slice = list.slice(page * size, page * size + size);
  $('workersBody').replaceChildren(...slice.map(workerRow));
  $('emptyWorkers').hidden = list.length !== 0;
  $('workerPager').hidden = list.length <= size;
  $('workerRange').textContent = list.length ? `${page * size + 1}–${Math.min(list.length, (page + 1) * size)} / ${list.length}` : '0–0 / 0';
  $('workerPrev').disabled = page === 0; $('workerNext').disabled = page >= pages - 1;
}
function workerRow(worker) {
  const tr = document.createElement('tr');
  const state = worker.structure.structuralState;
  const cells = [worker.target.workerLabel || '—', worker.target.title || worker.target.url || '—', state, worker.target.status || 'stopped', worker.target.lastError || '—', String(worker.target.sentCount || 0)];
  for (const value of cells) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
  const action = document.createElement('td');
  if (worker.tab?.id) { const button = document.createElement('button'); button.textContent = '열기'; button.className = 'soft small'; button.onclick = () => chrome.tabs.update(worker.tab.id, { active: true }); action.append(button); }
  tr.append(action); return tr;
}
function renderRoutes() {
  const sorted = [...routes].sort((a,b) => Number(b.createdAt || b.ambiguousAt || 0) - Number(a.createdAt || a.ambiguousAt || 0));
  $('routingBody').replaceChildren(...sorted.slice(0, 100).map(routeRow));
  $('emptyRouting').hidden = sorted.length !== 0;
}
function routeRow(route) {
  const tr = document.createElement('tr');
  for (const value of [route.type || 'ROUTE', `${route.from || '—'} → ${route.targetRouteId || route.to || '—'}`, route.status || 'pending', formatTime(route.deliveredAt || route.resolvedAt || route.ambiguousAt || route.createdAt)]) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
  const action = document.createElement('td');
  if (route.status === 'ambiguous') {
    for (const [label, type] of [['Retry','PARROT_ROUTE_RETRY'],['Resolve','PARROT_ROUTE_RESOLVE']]) { const b = document.createElement('button'); b.textContent = label; b.className = 'soft small'; b.dataset.queueId = route.queueId; b.dataset.routeAction = type; action.append(b); }
  }
  tr.append(action); return tr;
}
async function routeAction(event) {
  const button = event.target.closest('button[data-route-action]'); if (!button) return;
  button.disabled = true;
  const result = await chrome.runtime.sendMessage({ type: button.dataset.routeAction, queueId: button.dataset.queueId });
  toast(result?.ok ? '처리했습니다.' : `처리 실패: ${result?.reason || 'unknown'}`); await refresh();
}
function renderEvents(events) {
  const list = Array.isArray(events) ? events.slice(-50).reverse() : [];
  $('events').replaceChildren(...list.map((event) => { const div = document.createElement('div'); div.className = 'event'; div.textContent = `${formatTime(event.at)} ${event.type || 'event'} ${event.workerLabel || ''}`.trim(); return div; }));
  $('emptyEvents').hidden = list.length !== 0;
}
function formatTime(value) { const n = Number(value); return Number.isFinite(n) && n > 0 ? new Date(n).toLocaleString() : '—'; }
function toast(message) { $('toast').textContent = message; setTimeout(() => { $('toast').textContent = ''; }, 2500); }
