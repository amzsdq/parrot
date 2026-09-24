const $ = (id) => document.getElementById(id);
const state = { snapshot: { targets: [], workers: [], routing: [], events: [] }, query: '', filter: 'all', page: 1, pageSize: 25 };

$('refresh').addEventListener('click', refresh);
$('newTarget').addEventListener('click', () => chrome.runtime.openOptionsPage?.());
$('searchWorkers').addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); state.page = 1; render(); });
$('filterWorkers').addEventListener('change', (event) => { state.filter = event.target.value; state.page = 1; render(); });
$('workerPageSize').addEventListener('change', (event) => { state.pageSize = Number(event.target.value || 25); state.page = 1; render(); });
$('workerPrev').addEventListener('click', () => { if (state.page > 1) { state.page -= 1; render(); } });
$('workerNext').addEventListener('click', () => { state.page += 1; render(); });
$('workersBody').addEventListener('click', onWorkerAction);
$('routingBody').addEventListener('click', onRouteAction);

refresh();
setInterval(refresh, 5000);

async function refresh() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'PARROT_DASHBOARD_SNAPSHOT' });
    if (!response?.ok) throw new Error(response?.reason || 'snapshot_failed');
    state.snapshot = response.snapshot || response;
    render();
  } catch (error) {
    toast(`상태 조회 실패: ${error.message || error}`);
  }
}

function render() {
  const targets = Array.isArray(state.snapshot.targets) ? state.snapshot.targets : [];
  const workers = Array.isArray(state.snapshot.workers) ? state.snapshot.workers : [];
  const routing = Array.isArray(state.snapshot.routing) ? state.snapshot.routing : [];
  $('statTargets').textContent = String(targets.length || workers.length);
  $('statOpen').textContent = String(workers.filter((w) => w.tabOpen).length);
  $('statRunning').textContent = String(targets.filter((t) => t.status === 'running').length);
  $('statAttention').textContent = String(workers.filter(needsAttention).length + routing.filter((r) => r.status === 'ambiguous').length);
  renderWorkers(workers, targets);
  renderRouting(routing);
  renderEvents(Array.isArray(state.snapshot.events) ? state.snapshot.events : []);
}

function renderWorkers(workers, targets) {
  const targetById = new Map(targets.map((t) => [t.id, t]));
  const filtered = workers.filter((worker) => {
    const target = targetById.get(worker.targetId) || {};
    const haystack = `${target.workerLabel || ''} ${target.title || ''} ${target.routeKey || ''} ${target.url || ''}`.toLowerCase();
    if (state.query && !haystack.includes(state.query)) return false;
    if (state.filter === 'open' && !worker.tabOpen) return false;
    if (state.filter === 'running' && target.status !== 'running') return false;
    if (state.filter === 'attention' && !needsAttention(worker)) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  const visible = filtered.slice(start, start + state.pageSize);
  $('workersBody').innerHTML = visible.map((worker) => workerRow(worker, targetById.get(worker.targetId) || {})).join('');
  $('emptyWorkers').hidden = filtered.length > 0;
  $('workerPager').hidden = filtered.length <= state.pageSize;
  $('workerRange').textContent = filtered.length ? `${start + 1}–${Math.min(start + state.pageSize, filtered.length)} / ${filtered.length}` : '0–0 / 0';
  $('workerPrev').disabled = state.page <= 1;
  $('workerNext').disabled = state.page >= pages;
}

function workerRow(worker, target) {
  const structural = structuralTabLabel(worker);
  const activity = worker.inspectOk ? (worker.inspect?.generating ? '생성 중' : worker.inspect?.composerReady ? '입력 가능' : '대기') : (worker.inspectError || '—');
  return `<tr>
    <td><strong>${esc(target.workerLabel || '?')}</strong><br><small>${esc(target.routeKey || '')}</small></td>
    <td>${esc(target.title || target.url || '미설정')}</td>
    <td>${esc(structural)}</td>
    <td>${esc(target.status || 'stopped')}</td>
    <td>${esc(activity)}</td>
    <td>${Number(target.sentCount || 0)}</td>
    <td class="actions"><button class="soft small" data-action="focus" data-id="${escAttr(worker.targetId)}">열기</button> <button class="soft small" data-action="start" data-id="${escAttr(worker.targetId)}">시작</button> <button class="soft small" data-action="trigger" data-id="${escAttr(worker.targetId)}">1회</button></td>
  </tr>`;
}

function structuralTabLabel(worker) {
  if (!worker.tabOpen) return '닫힘';
  if (worker.discarded === true) return 'discarded';
  if (worker.frozen === true) return 'frozen';
  if (worker.frozenSupport === 'unknown') return '열림 · frozen ?';
  return '열림';
}

function needsAttention(worker) {
  if (worker.discarded === true || worker.frozen === true) return true;
  return Boolean(worker.tabOpen && !worker.inspectOk && worker.inspectError);
}

function renderRouting(routing) {
  $('routingBody').innerHTML = routing.map((item) => {
    const actions = item.status === 'ambiguous'
      ? `<button class="soft small" data-route-action="retry" data-id="${escAttr(item.queueId)}">Retry</button> <button class="soft small" data-route-action="resolve" data-id="${escAttr(item.queueId)}">Resolve</button>`
      : '';
    return `<tr><td>${esc(item.type || '')}</td><td>${esc(item.sourceName || item.sourceRouteKey || '?')} → ${esc(item.targetName || item.targetRouteKey || '?')}</td><td>${esc(item.status || '')}</td><td>${esc(formatTime(item.deliveredAt || item.resolvedAt || item.ambiguousAt || item.createdAt))}</td><td>${actions}</td></tr>`;
  }).join('');
  $('emptyRouting').hidden = routing.length > 0;
}

function renderEvents(events) {
  $('events').innerHTML = events.slice(0, 50).map((event) => `<article class="event"><strong>${esc(event.type || 'event')}</strong><span>${esc(formatTime(event.at || event.createdAt))}</span><p>${esc(event.label || event.reason || '')}</p></article>`).join('');
  $('emptyEvents').hidden = events.length > 0;
}

async function onWorkerAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const type = ({ focus: 'PARROT_FOCUS_TARGET', start: 'PARROT_START_TARGET', trigger: 'PARROT_TRIGGER_TARGET' })[button.dataset.action];
  if (!type) return;
  await sendAction({ type, targetId: button.dataset.id });
}

async function onRouteAction(event) {
  const button = event.target.closest('button[data-route-action]');
  if (!button) return;
  const type = button.dataset.routeAction === 'retry' ? 'PARROT_ROUTE_RETRY' : button.dataset.routeAction === 'resolve' ? 'PARROT_ROUTE_RESOLVE' : '';
  if (!type) return;
  await sendAction({ type, queueId: button.dataset.id });
}

async function sendAction(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    if (!response?.ok) throw new Error(response?.reason || 'action_failed');
    await refresh();
  } catch (error) {
    toast(`작업 실패: ${error.message || error}`);
  }
}

function formatTime(value) {
  const n = Number(value || 0);
  if (!n) return '—';
  try { return new Date(n).toLocaleString(); } catch { return '—'; }
}
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]); }
function escAttr(value) { return esc(value); }
function toast(text) { $('toast').textContent = text; clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('toast').textContent = ''; }, 3500); }
