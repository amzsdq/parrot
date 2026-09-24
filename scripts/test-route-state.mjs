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
const assert = (condition, message) => condition ? console.log(`PASS: ${message}`) : (failures += 1, console.error(`FAIL: ${message}`));

for (const test of vectors) {
  switch (test.id) {
    case 'strong-user-message-receipt':
    case 'strong-generation-receipt':
    case 'composer-clear-is-not-proof':
    case 'composer-change-is-not-proof': {
      const status = model.classifyStrongReceipt({ beforeUserCount: test.initial.beforeUserCount, afterUserCount: test.observation.afterUserCount, generating: test.observation.generating });
      assert(status === test.expected.status, `${test.id}: ${status}`); break;
    }
    case 'ambiguous-periodic-processing': assert(!model.canAutoDispatch(test.initial), `${test.id}: fenced`); break;
    case 'ambiguous-reconciliation': {
      const next = model.reconcileAmbiguity(test.initial, { ambiguousAt: 1000 });
      assert(next.status === 'ambiguous' && !model.canAutoDispatch(next), `${test.id}: state-only`); break;
    }
    case 'manual-retry': {
      const next = model.manualRetry(test.initial, 1000);
      assert(next.status === 'pending' && model.canAutoDispatch(next), `${test.id}: authorized pending`); break;
    }
    case 'manual-resolve': {
      const next = model.manualResolve(test.initial, test.event.at);
      assert(next.status === 'resolved' && next.resolvedAt === test.event.at && !model.canAutoDispatch(next), `${test.id}: terminal`); break;
    }
    case 'ambiguity-outbox-upsert': {
      const out = model.putAmbiguityReceipt(test.initial.outbox, test.event.receipt, 100);
      assert(out.length === test.expected.length && out[0].queueId === test.expected.queueId && out[0].ambiguousAt === test.expected.ambiguousAt, `${test.id}: idempotent replace`); break;
    }
    case 'ambiguity-outbox-bounded': {
      const initial = Array.from({ length: test.initial.count }, (_, i) => ({ queueId: `q${i + 1}`, ambiguousAt: i + 1 }));
      const out = model.putAmbiguityReceipt(initial, test.event.receipt, test.event.maxEntries);
      assert(JSON.stringify(out.map((x) => x.queueId)) === JSON.stringify(test.expected.queueIds), `${test.id}: oldest evicted`); break;
    }
    case 'ambiguity-outbox-ack': {
      const out = model.ackAmbiguityReceipt(test.initial.outbox, test.event.queueId);
      assert(JSON.stringify(out.map((x) => x.queueId)) === JSON.stringify(test.expected.queueIds), `${test.id}: acknowledged removed`); break;
    }
    case 'prune-mixed-terminal-history': {
      const records = [...Array.from({ length: test.initialCounts.pending }, (_, i) => ({ id:`p${i}`,status:'pending' })), ...Array.from({ length:test.initialCounts.delivered },(_,i)=>({id:`d${i}`,status:'delivered',deliveredAt:i+1})), ...Array.from({ length:test.initialCounts.resolved },(_,i)=>({id:`r${i}`,status:'resolved',resolvedAt:i+1}))];
      const kept = model.pruneRouteRecords(records, test.maxRouteRecords);
      assert(kept.length === test.expectedCounts.total && kept.filter((r)=>r.status==='pending').length === test.expectedCounts.active, `${test.id}: active retained`); break;
    }
    case 'prune-active-over-cap': {
      const records = Array.from({ length:test.initialCounts.pending },(_,i)=>({id:`p${i}`,status:'pending'}));
      assert(model.pruneRouteRecords(records,test.maxRouteRecords).length===test.expectedCounts.total, `${test.id}: no active loss`); break;
    }
    case 'tab-discarded':
    case 'tab-frozen-chrome132-plus':
    case 'tab-frozen-property-unsupported': {
      const actual=model.classifyTabStructure(test.tab);
      assert(Object.entries(test.expected).every(([k,v])=>actual[k]===v), `${test.id}: structural classification`); break;
    }
    default: assert(false, `unhandled vector ${test.id}`);
  }
}
if (failures) process.exitCode = 1;
