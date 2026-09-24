import{readFileSync}from'node:fs';
const path=process.argv[2]||'docs/LIVE_SMOKE_RESULT.md',expected=process.argv[3]||'f51e4ba53753dade3bd3f9a64e2b3c50ca05d691';let s;try{s=readFileSync(path,'utf8')}catch(e){console.error(`FAIL: missing live result ${path}`);process.exit(1)}
const lines=s.split(/\r?\n/),field=(label)=>{const line=lines.find(x=>x.startsWith(label+':'));return line?line.slice(label.length+1).trim():''},clean=x=>x.replace(/^`|`$/g,'').trim();
if(clean(field('Candidate source SHA'))!==expected){console.error('FAIL: live result is not bound to expected candidate SHA');process.exit(1)}
const browser=field('- Browser + version'),os=field('- OS'),loaded=field('- Extension loaded from exact candidate source/artifact'),start=field('- UTC start'),targets=field('- ChatGPT worker URLs/labels used (URLs only; no chat prose)');let bad=false;
for(const[name,value]of[['Browser + version',browser],['OS',os],['UTC start',start],['ChatGPT worker URLs/labels',targets]])if(!value){console.error(`FAIL: missing environment provenance: ${name}`);bad=true}if(!/^YES\b/i.test(loaded)){console.error('FAIL: exact candidate extension load must be recorded YES');bad=true}if(!/https:\/\/chatgpt\.com\//i.test(targets)){console.error('FAIL: environment must record at least one real https://chatgpt.com/ target URL');bad=true}
const rows=new Map();for(const line of lines){const m=line.match(/^\|\s*S(\d+)\b[^|]*\|\s*(PASS|FAIL|NOT_OBSERVED|UNVERIFIED)\s*\|\s*([^|]*)\|\s*([^|]*)\|/);if(m)rows.set(Number(m[1]),{state:m[2],evidence:m[3].trim(),utc:m[4].trim()});}
for(const n of[1,2,3,4,5,6,7,8,11]){const r=rows.get(n);if(r?.state!=='PASS'){console.error(`FAIL: S${n} must be PASS, got ${r?.state||'MISSING'}`);bad=true;continue}if(!r.evidence||!r.utc){console.error(`FAIL: S${n} PASS requires structural evidence and UTC`);bad=true}}
for(const n of[9,10]){const r=rows.get(n);if(!['PASS','NOT_OBSERVED'].includes(r?.state)){console.error(`FAIL: S${n} must be PASS or explicit NOT_OBSERVED, got ${r?.state||'MISSING'}`);bad=true;continue}if(!r.evidence||!r.utc){console.error(`FAIL: S${n} ${r.state} requires evidence/limitation rationale and UTC`);bad=true}}
if(/\|\s*S\d+\b[^|]*\|\s*FAIL\s*\|/.test(s)){console.error('FAIL: observed FAIL remains in live evidence');bad=true}
const requiredDecision=field('- Required S1–S8 + S11 all PASS'),s9Decision=field('- S9'),s10Decision=field('- S10'),m6Decision=field('- M6 decision'),decisionUtc=field('- UTC decision time'),limitations=field('- Explicit limitations carried to release notes');
if(!/^YES\b/i.test(requiredDecision)){console.error('FAIL: decision must explicitly confirm required S1-S8 + S11 all PASS');bad=true}
if(clean(s9Decision)!==rows.get(9)?.state){console.error('FAIL: S9 decision summary does not match result row');bad=true}
if(clean(s10Decision)!==rows.get(10)?.state){console.error('FAIL: S10 decision summary does not match result row');bad=true}
if(clean(m6Decision)!=='PASS'){console.error('FAIL: M6 decision must explicitly be PASS');bad=true}
if(!decisionUtc){console.error('FAIL: missing UTC decision time');bad=true}
const hasNotObserved=rows.get(9)?.state==='NOT_OBSERVED'||rows.get(10)?.state==='NOT_OBSERVED';if(hasNotObserved&&!limitations){console.error('FAIL: NOT_OBSERVED S9/S10 requires explicit release-note limitation text');bad=true}
if(bad)process.exit(1);console.log(`PASS: M6 live evidence is complete, internally consistent, and provenance-bearing for candidate ${expected}`);if(hasNotObserved)console.log('LIMITATION: S9/S10 NOT_OBSERVED must be carried into release notes.');
