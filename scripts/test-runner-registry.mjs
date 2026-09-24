import assert from'node:assert/strict';import{createRequire}from'node:module';const require=createRequire(import.meta.url),{create}=require('../extension/runner-registry.js');
let n=0;const r=create(()=>`t${++n}`),launches=[];const launch=(label)=>(token)=>launches.push({label,token});
// startup/reload auto-arm wins the first claim; storage reconciliation and explicit PARROT_START cannot create a second effective runner.
assert.equal(r.startIfIdle('A','response',launch('startup')),true);const first=r.snapshot('A');assert.deepEqual(first,{token:'t1',mode:'response'});assert.equal(r.startIfIdle('A','response',launch('storage')),false);assert.equal(r.startIfIdle('A','response',launch('manual')),false);assert.equal(launches.length,1);assert.equal(r.isCurrent('A','t1'),true);
// A mode transition fences the old token before the replacement is admitted.
r.prune([{id:'A',status:'running',mode:'interval'}]);assert.equal(r.isCurrent('A','t1'),false);assert.equal(r.startIfIdle('A','interval',launch('mode-transition')),true);assert.deepEqual(r.snapshot('A'),{token:'t2',mode:'interval'});assert.equal(r.startIfIdle('A','interval',launch('storage-after-transition')),false);assert.equal(launches.length,2);
// Stale finally/release from the old runner cannot delete the replacement.
assert.equal(r.release('A','t1'),false);assert.deepEqual(r.snapshot('A'),{token:'t2',mode:'interval'});
// Stop/delete reconciliation removes authority; repeated prune is idempotent.
r.prune([{id:'A',status:'stopped',mode:'interval'}]);assert.equal(r.snapshot('A'),null);r.prune([]);assert.equal(r.snapshot('A'),null);
// Synchronous launch failure rolls the claim back so a later valid start can recover.
assert.throws(()=>r.startIfIdle('B','response',()=>{throw new Error('boom')}),/boom/);assert.equal(r.snapshot('B'),null);assert.equal(r.startIfIdle('B','response',launch('recovery')),true);assert.deepEqual(r.snapshot('B'),{token:'t4',mode:'response'});
console.log('PASS: deterministic runner registry overlap, fencing, cleanup, and recovery');
