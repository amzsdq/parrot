import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vectors = JSON.parse(readFileSync(join(root, 'tests/route-state-contract.json'), 'utf8')).cases;
const source = readFileSync(join(root, 'extension/route-state.js'), 'utf8');
const context = { globalThis: {}, Date, Number, Math, Set, Object };
vm.createContext(context);
vm.runInContext(source, context);
const model = context.globalThis.ParrotRouteState;
let failures = 0;

function assert(condition, message) {
  if (condition) console.log(`PASS: ${message}`);
  else { failures += 1; console.error(`FAIL: ${message}`); }
}

for (const test of vectors) {
  switch (test.id) {
    case 'strong-user-message-receipt':
    case 'strong-generation-receipt':
    case 'composer-clear-is-not-proof':
    case 'composer-change-is-not-proof': {
      const status = model.classifyStrongReceipt({
        beforeUserCount: test.initial.beforeUserCount,
        afterUserCount: test.observation.afterUserCount,
        generating: test.observation.generating
      });
      assert(status === test.expected.status, `${test.id}: ${status}`);
      break;
    }
    case 'ambiguous-periodic-processing':
      assert(model.canAutoDispatch(test.initial) === false, `${test.id}: fenced from auto dispatch`);
      break;
    case 'ambiguous-reconciliation': {
      const next = model.reconcileAmbiguity(test.initial, { ambiguousAt: 1000 });
      assert(next.status === 'ambiguous' && model.canAutoDispatch(next) === false, `${test.id}: state-only reconciliation`);
      break;
    }
    case 'manual-retry': {
      const next = model.manualRetry(test.initial);
      assert(next.status === 'pending' && model.canAutoDispatch(next), `${test.id}: explicit authorization returns to pending`);
      break;
    }
    case 'manual-resolve': {
      const next = model.manualResolve(test.initial, test.event.at);
      assert(next.status === 'resolved' && next.resolvedAt === test.event.at && !model.canAutoDispatch(next), `${test.id}: terminal resolve`);
      break;
    }
    case 'prune-mixed-terminal-history': {
      const records = [
        ...Array.from({ length: test.initialCounts.pending }, (_, i) => ({ id: `p${i}`, status: 'pending' })),
        ...Array.from({ length: test.initialCounts.delivered }, (_, i) => ({ id: `d${i}`, status: 'delivered', deliveredAt: i + 1 })),
        ...Array.from({ length: test.initialCounts.resolved }, (_, i) => ({ id: `r${i}`, status: 'resolved', resolvedAt: i + 1 }))
      ];
      const kept = model.pruneRouteRecords(records, test.maxRouteRecords);
      assert(kept.length === test.expectedCounts.total && kept.filter((r) => r.status === 'pending').length === test.expectedCounts.active, `${test.id}: active retained + bounded terminal`);
      break;
    }
    case 'prune-active-over-cap': {
      const records = Array.from({ length: test.initialCounts.pending }, (_, i) => ({ id: `p${i}`, status: 'pending' }));
      const kept = model.pruneRouteRecords(records, test.maxRouteRecords);
      assert(kept.length === test.expectedCounts.total, `${test.id}: active records exceed cap without loss`);
      break;
    }
    default:
      console.log(`SKIP: ${test.id}: belongs to dashboard/tab structural classifier`);
  }
}

if (failures) process.exitCode = 1;
