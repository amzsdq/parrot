import fs from'node:fs';import crypto from'node:crypto';
const path=new URL('../extension/popup.js',import.meta.url),EXPECTED='04b3a2b425f37ee33de2b7194bd7dbea8aaa93da';let s=fs.readFileSync(path,'utf8');
const edits=[
["t.delaySec = Number(els.delaySec.value || 0);","t.delaySec = Math.max(0, Number(els.delaySec.value || 0));"],
["t.intervalMin = Number(els.intervalMin.value || 1);","t.intervalMin = Math.max(1, Number(els.intervalMin.value || 11));"],
["t.maxRepeats = Number(els.maxRepeats.value || 0);","t.maxRepeats = Math.max(0, Number(els.maxRepeats.value || 0));"],
["t.runtimeMin = Number(els.runtimeMin.value || 0);","t.runtimeMin = Math.max(0, Number(els.runtimeMin.value || 0));"]];
for(const[from,to]of edits){const n=s.split(from).length-1;if(n!==1)throw new Error(`expected exactly one source occurrence for: ${from}; got ${n}`);s=s.replace(from,to);}
const blob=crypto.createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');if(blob!==EXPECTED)throw new Error(`repaired popup blob mismatch: ${blob} != ${EXPECTED}`);fs.writeFileSync(path,s);console.log(`PASS: popup safety repaired to exact blob ${blob}`);
