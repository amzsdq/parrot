import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = join(root, 'tests');
const files = readdirSync(testsDir).filter((name) => name.endsWith('-contract.json')).sort();

if (!files.length) throw new Error('no *-contract.json files found');

let total = 0;
for (const file of files) {
  const doc = JSON.parse(readFileSync(join(testsDir, file), 'utf8'));
  if (doc.schema !== 1) throw new Error(`${file}: unsupported contract schema: ${doc.schema}`);
  if (!Array.isArray(doc.cases) || doc.cases.length === 0) throw new Error(`${file}: contract cases missing`);

  const ids = new Set();
  for (const [index, item] of doc.cases.entries()) {
    if (!item || typeof item !== 'object') throw new Error(`${file}: case ${index} is not an object`);
    if (typeof item.id !== 'string' || !item.id.trim()) throw new Error(`${file}: case ${index} has no id`);
    if (ids.has(item.id)) throw new Error(`${file}: duplicate case id: ${item.id}`);
    ids.add(item.id);
    if (!Object.prototype.hasOwnProperty.call(item, 'expected')) throw new Error(`${file}: case ${item.id} has no expected value`);
  }
  total += doc.cases.length;
  console.log(`PASS: ${file}: ${doc.cases.length} vectors`);
}

console.log(`PASS: ${total} contract vectors across ${files.length} files.`);
