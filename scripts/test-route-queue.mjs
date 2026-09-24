import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const context = { globalThis: {}, Date, Number, Math, Set, Object, TypeError, Error };
vm.createContext(context);
for (const file of ['route-state.js', 'route-queue.js']) vm.runInContext(readFileSync(join(root, 'extension', file), 'utf8'), context);

let queue = [
  { queueId: 'p1', status: 'pending' },
  { queueId: 'a1', status: 'ambiguous' },
  { queueId: 'd1', status: 'delivered', deliveredAt: 1 },
  { queueId: 'r1', status: 'resolved', resolvedAt: 2 }
];
let dispatches = [];
const api = context.globalThis.ParrotRouteQueue.createRouteQueueApi({
  load: async () => structuredClone(queue),
  save: async (next) => { queue = structuredClone(next); },
  dispatch: async (item) => { dispatches.push(item.queueId); return { ok: true }; },
  now: () => 5000,
  maxRecords: 300
});

function assert(condition, message) {
  if (!condition) { console.error(`FAIL: ${message}`); process.exitCode = 1; }
  else console.log(`PASS: ${message}`);
}

await api.processEligible();
assert(JSON.stringify(dispatches) === '["p1"]', 'periodic processing dispatches pending only');

dispatches = [];
const reconciled = await api.reconcileAmbiguity({ queueId: 'p1', ambiguousAt: 3000, reason: 'strong_receipt_timeout', beforeUserCount: 4, afterUserCount: 4, generationObserved: false, message: 'MUST_NOT_PERSIST' });
assert(reconciled.ok && reconciled.item.status === 'ambiguous' && dispatches.length === 0, 'ambiguity reconciliation is state-only');
assert(reconciled.item.ambiguity.message === undefined && reconciled.item.ambiguity.queueId === 'p1', 'ambiguity persistence strips semantic/unapproved fields');

const retry = await api.manualRetry('a1');
assert(retry.ok && retry.dispatched && dispatches.filter((id) => id === 'a1').length === 1, 'manual retry authorizes exactly one dispatch call');

const resolve = await api.manualResolve('p1');
assert(resolve.ok && resolve.item.status === 'resolved' && !resolve.dispatched, 'manual resolve is terminal without dispatch');

const delivered = await api.recordDelivered('a1', { deliveredAt: 6000 });
assert(delivered.status === 'delivered' && delivered.deliveredAt === 6000, 'strong receipt marks delivered');
