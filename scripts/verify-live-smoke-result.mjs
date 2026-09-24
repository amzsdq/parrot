import{readFileSync}from'node:fs';
const path=process.argv[2]||'docs/LIVE_SMOKE_RESULT.md',expected=process.argv[3]||'f51e4ba53753dade3bd3f9a64e2b3c50ca05d691';let s;try{s=readFileSync(path,'utf8')}catch(e){console.error(`FAIL: missing live result ${path}`);process.exit(1)}
const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(!new RegExp(`Candidate source SHA:\\s*\x60?${esc(expected)}\x60?`).test(s)){console.error('FAIL: live result is not bound to expected candidate SHA');process.exit(1)}
const rows=new Map();for(const line of s.split(/\r?\n/)){const m=line.match(/^\|\s*S(\d+)\b[^|]*\|\s*(PASS|FAIL|NOT_OBSERVED|UNVERIFIED)\s*\|/);if(m)rows.set(Number(m[1]),m[2]);}
let bad=false;for(const n of[1,2,3,4,5,6,7,8,11]){if(rows.get(n)!=='PASS'){console.error(`FAIL: S${n} must be PASS, got ${rows.get(n)||'MISSING'}`);bad=true;}}
for(const n of[9,10]){if(!['PASS','NOT_OBSERVED'].includes(rows.get(n))){console.error(`FAIL: S${n} must be PASS or explicit NOT_OBSERVED, got ${rows.get(n)||'MISSING'}`);bad=true;}}
if(/\|\s*S\d+\b[^|]*\|\s*FAIL\s*\|/.test(s)){console.error('FAIL: observed FAIL remains in live evidence');bad=true;}
if(bad)process.exit(1);console.log(`PASS: M6 live evidence is complete for candidate ${expected}`);if(rows.get(9)==='NOT_OBSERVED'||rows.get(10)==='NOT_OBSERVED')console.log('LIMITATION: S9/S10 NOT_OBSERVED must be carried into release notes.');
