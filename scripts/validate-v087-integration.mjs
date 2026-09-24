import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ext = join(root, 'extension');
let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL: ${message}`); };
const pass = (message) => console.log(`PASS: ${message}`);

for (const name of ['manifest.json', 'route-state.js', 'route-queue.js', 'background.js', 'content.js', 'chatgpt-adapter.js', 'popup.js']) if (!existsSync(join(ext, name))) fail(`missing extension/${name}`);

if (!failures) {
  const manifest = JSON.parse(readFileSync(join(ext, 'manifest.json'), 'utf8'));
  const background = readFileSync(join(ext, 'background.js'), 'utf8');
  const content = readFileSync(join(ext, 'content.js'), 'utf8');
  const adapter = readFileSync(join(ext, 'chatgpt-adapter.js'), 'utf8');
  const popup = readFileSync(join(ext, 'popup.js'), 'utf8');
  const scripts = manifest.content_scripts?.flatMap((entry) => entry.js || []) || [];
  const routeIndex = scripts.indexOf('route-state.js');
  const contentIndex = scripts.indexOf('content.js');

  if (routeIndex >= 0 && contentIndex > routeIndex) pass('content loads canonical route-state before content.js'); else fail('manifest must load route-state.js before content.js');
  if (manifest.background?.type === 'module') fail('selected v0.8.7 strategy is classic worker; remove background.type=module'); else pass('background is classic service worker');
  if (/importScripts\([^)]*['"]route-state\.js['"][^)]*\)/.test(background)) pass('background imports canonical route-state.js'); else fail('background must import route-state.js with importScripts');
  if (/importScripts\([^)]*['"]route-queue\.js['"][^)]*\)/.test(background)) pass('background imports canonical route-queue.js'); else fail('background must import route-queue.js with importScripts');
  if (background.includes('ParrotRouteState.canAutoDispatch')) pass('background uses pending-only dispatch guard'); else fail('background does not use ParrotRouteState.canAutoDispatch');
  if (background.includes('PARROT_ROUTE_RETRY') && background.includes('PARROT_ROUTE_RESOLVE')) pass('background exposes explicit ambiguity actions'); else fail('background ambiguity actions missing');

  if (content.includes('getUserMessageCount')) pass('content captures user-message structural evidence'); else fail('content does not use user-message-count receipt evidence');
  if (content.includes('ParrotRouteState.putAmbiguityReceipt')) pass('content uses bounded ambiguity-outbox primitive'); else fail('content does not use canonical ambiguity-outbox primitive');
  if (/await\s+persistAmbiguity\(receipt\)[\s\S]*sendMessage\(\{\s*type:\s*['"]PARROT_ROUTE_AMBIGUOUS['"]/.test(content)) pass('content persists ambiguity before transient notification'); else fail('ambiguity must persist before background notification');
  if (/return\s+['"]composer_(?:cleared|changed)['"]/.test(content)) fail('composer-only evidence is still accepted as delivery receipt'); else pass('composer-only receipt acceptance pattern absent');
  if (popup.includes("type: 'PARROT_START'") && content.includes("message?.type === 'PARROT_START'")) pass('popup PARROT_START has a content receiver'); else fail('popup/content PARROT_START contract is disconnected');
  if (content.includes('waitUntilIdleOrStopped') && content.includes("target.mode !== 'response'")) pass('response runner waits for generation lifecycle and respects mode'); else fail('response repeat runner missing lifecycle guard');

  if (adapter.includes('getUserMessageCount')) pass('ChatGPT adapter exposes getUserMessageCount'); else fail('ChatGPT adapter missing getUserMessageCount');
}

if (failures) { console.error(`v0.8.7 integration guard failed: ${failures}`); process.exitCode = 1; }
else console.log('v0.8.7 integration guard passed.');
