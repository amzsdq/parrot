import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'); const ext = join(root, 'extension'); let failures = 0;
const fail = (m) => { failures++; console.error(`FAIL: ${m}`); }; const pass = (m) => console.log(`PASS: ${m}`);
for (const name of ['manifest.json','route-state.js','route-queue.js','background.js','content.js','signal-scanner.js','chatgpt-adapter.js','popup.js']) if (!existsSync(join(ext,name))) fail(`missing extension/${name}`);
if (!failures) {
  const manifest=JSON.parse(readFileSync(join(ext,'manifest.json'),'utf8')); const background=readFileSync(join(ext,'background.js'),'utf8'); const content=readFileSync(join(ext,'content.js'),'utf8'); const scanner=readFileSync(join(ext,'signal-scanner.js'),'utf8'); const adapter=readFileSync(join(ext,'chatgpt-adapter.js'),'utf8'); const popup=readFileSync(join(ext,'popup.js'),'utf8');
  const scripts=manifest.content_scripts?.flatMap((e)=>e.js||[])||[]; const routeIndex=scripts.indexOf('route-state.js'); const scannerIndex=scripts.indexOf('signal-scanner.js'); const contentIndex=scripts.indexOf('content.js');
  routeIndex>=0&&contentIndex>routeIndex?pass('content loads canonical route-state before content.js'):fail('manifest must load route-state.js before content.js');
  scannerIndex>=0&&scannerIndex<contentIndex?pass('structural signal scanner is loaded before content runner'):fail('signal-scanner.js must load before content.js');
  manifest.background?.type==='module'?fail('selected v0.8.7 strategy is classic worker'):pass('background is classic service worker');
  /importScripts\([^)]*['"]route-state\.js['"][^)]*\)/.test(background)?pass('background imports route-state'):fail('background route-state import missing');
  /importScripts\([^)]*['"]route-queue\.js['"][^)]*\)/.test(background)?pass('background imports route-queue'):fail('background route-queue import missing');
  background.includes('ParrotRouteState.canAutoDispatch')?pass('pending-only dispatch guard present'):fail('pending-only dispatch guard missing');
  background.includes('PARROT_ROUTE_RETRY')&&background.includes('PARROT_ROUTE_RESOLVE')?pass('explicit ambiguity actions present'):fail('ambiguity actions missing');
  background.includes('PARROT_SIGNAL_DISCOVERED')&&background.includes('signalId')?pass('durable structural signal ingestion/dedupe present'):fail('signal ingestion/dedupe missing');
  scanner.includes("a[href^=\"https://parrot.invalid/\"]")&&!scanner.includes('innerText')&&!scanner.includes('textContent')?pass('signal scanner uses anchor href structure only'):fail('signal scanner must remain structural-only');
  content.includes('getUserMessageCount')?pass('user-message receipt evidence present'):fail('user-message receipt evidence missing');
  content.includes('ParrotRouteState.putAmbiguityReceipt')?pass('bounded ambiguity outbox present'):fail('ambiguity outbox missing');
  /await\s+persistAmbiguity\(receipt\)[\s\S]*sendMessage\(\{\s*type:\s*['"]PARROT_ROUTE_AMBIGUOUS['"]/.test(content)?pass('ambiguity persists before notify'):fail('ambiguity persistence order wrong');
  /return\s+['"]composer_(?:cleared|changed)['"]/.test(content)?fail('composer-only evidence accepted'):pass('composer-only receipt acceptance absent');
  popup.includes("type: 'PARROT_START'")&&content.includes("message?.type === 'PARROT_START'")?pass('PARROT_START connected'):fail('PARROT_START disconnected');
  content.includes('waitUntilIdleOrStopped')&&content.includes("target.mode !== 'response'")?pass('response runner lifecycle guard present'):fail('response runner lifecycle guard missing');
  adapter.includes('getUserMessageCount')?pass('adapter exposes user count'):fail('adapter user count missing');
}
if(failures){console.error(`v0.8.7 integration guard failed: ${failures}`);process.exitCode=1;}else console.log('v0.8.7 integration guard passed.');
