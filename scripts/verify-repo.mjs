import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extensionDir = join(root, 'extension');
const manifestPath = join(extensionDir, 'manifest.json');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(manifestPath)) {
  fail('extension/manifest.json is missing');
  process.exit();
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  console.log(`PASS: manifest parsed (v${manifest.version || 'unknown'})`);
} catch (error) {
  fail(`manifest parse error: ${error.message}`);
  process.exit();
}

const required = new Set();
if (manifest.background?.service_worker) required.add(manifest.background.service_worker);
if (manifest.action?.default_popup) required.add(manifest.action.default_popup);
for (const entry of manifest.content_scripts || []) {
  for (const file of entry.js || []) required.add(file);
  for (const file of entry.css || []) required.add(file);
}

for (const relative of [...required].sort()) {
  const full = join(extensionDir, relative);
  if (existsSync(full)) console.log(`PASS: manifest reference exists: extension/${relative}`);
  else fail(`manifest reference missing: extension/${relative}`);
}

const htmlFiles = readdirSync(extensionDir).filter((name) => name.endsWith('.html'));
for (const htmlFile of htmlFiles) {
  const html = readFileSync(join(extensionDir, htmlFile), 'utf8');
  const refs = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|data:|#)/i.test(value));
  for (const relative of refs) {
    const clean = relative.replace(/^\.\//, '').split(/[?#]/, 1)[0];
    if (!clean) continue;
    const full = join(extensionDir, clean);
    if (existsSync(full)) console.log(`PASS: ${htmlFile} reference exists: extension/${clean}`);
    else fail(`${htmlFile} reference missing: extension/${clean}`);
  }
}

const jsFiles = readdirSync(extensionDir).filter((name) => name.endsWith('.js'));
for (const jsFile of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', join(extensionDir, jsFile)], { encoding: 'utf8' });
  if (result.status === 0) console.log(`PASS: syntax: extension/${jsFile}`);
  else fail(`syntax: extension/${jsFile}: ${(result.stderr || result.stdout || '').trim()}`);
}

if (process.exitCode) {
  console.error('Repository is NOT rebuildable as a complete extension source tree.');
} else {
  console.log('Repository rebuildability gate passed.');
}
