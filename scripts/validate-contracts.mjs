import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'tests', 'route-state-contract.json');
const doc = JSON.parse(readFileSync(path, 'utf8'));

if (doc.schema !== 1) throw new Error(`unsupported contract schema: ${doc.schema}`);
if (!Array.isArray(doc.cases) || doc.cases.length === 0) throw new Error('contract cases missing');

const ids = new Set();
for (const [index, item] of doc.cases.entries()) {
  if (!item || typeof item !== 'object') throw new Error(`case ${index} is not an object`);
  if (typeof item.id !== 'string' || !item.id.trim()) throw new Error(`case ${index} has no id`);
  if (ids.has(item.id)) throw new Error(`duplicate case id: ${item.id}`);
  ids.add(item.id);
  if (!item.expected || typeof item.expected !== 'object') throw new Error(`case ${item.id} has no expected object`);
}

console.log(`PASS: ${doc.cases.length} route/tab contract vectors parsed with unique ids.`);
