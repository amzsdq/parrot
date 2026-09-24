#!/usr/bin/env node
import fs from 'node:fs';

const [recordPath] = process.argv.slice(2);
if (!recordPath) {
  console.error('usage: verify-publication-record.mjs <record>');
  process.exit(2);
}

const expectedKeys = ['schema', 'release_repo_sha', 'artifact_sha256', 'ready_sha256'];
const lines = fs.readFileSync(recordPath, 'utf8').split(/\r?\n/).filter(Boolean);
const values = new Map();

for (const line of lines) {
  const i = line.indexOf('=');
  if (i <= 0) throw new Error(`malformed publication record line: ${line}`);
  const key = line.slice(0, i);
  const value = line.slice(i + 1);
  if (!expectedKeys.includes(key)) throw new Error(`unexpected publication record field: ${key}`);
  if (values.has(key)) throw new Error(`duplicate publication record field: ${key}`);
  values.set(key, value);
}

for (const key of expectedKeys) {
  if (!values.has(key)) throw new Error(`missing publication record field: ${key}`);
}
if (values.size !== expectedKeys.length) throw new Error('publication record field count mismatch');
if (values.get('schema') !== 'parrot-release-publication-v1') throw new Error('unsupported publication record schema');
if (!/^[0-9a-f]{40}$/.test(values.get('release_repo_sha'))) throw new Error('invalid release_repo_sha');
for (const key of ['artifact_sha256', 'ready_sha256']) {
  if (!/^[0-9a-f]{64}$/.test(values.get(key))) throw new Error(`invalid ${key}`);
}

process.stdout.write(JSON.stringify(Object.fromEntries(expectedKeys.map(k => [k, values.get(k)]))) + '\n');
