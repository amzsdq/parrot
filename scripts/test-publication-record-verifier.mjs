#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const verifier = new URL('./verify-publication-record.mjs', import.meta.url).pathname;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parrot-publication-record-'));
const repo = 'a'.repeat(40), artifact = 'b'.repeat(64), ready = 'c'.repeat(64);
const valid = `schema=parrot-release-publication-v1\nrelease_repo_sha=${repo}\nartifact_sha256=${artifact}\nready_sha256=${ready}\n`;

function run(name, text, ok) {
  const file = path.join(dir, `${name}.txt`);
  fs.writeFileSync(file, text);
  const r = spawnSync(process.execPath, [verifier, file], { encoding: 'utf8' });
  if ((r.status === 0) !== ok) {
    console.error(`${name}: expected ${ok ? 'PASS' : 'REJECT'}, got ${r.status}\n${r.stderr}`);
    process.exit(1);
  }
}

run('valid', valid, true);
run('duplicate', valid + `ready_sha256=${ready}\n`, false);
run('missing', valid.replace(/^ready_sha256=.*\n/m, ''), false);
run('unknown', valid + 'attacker_field=accepted\n', false);
run('schema-downgrade', valid.replace('parrot-release-publication-v1', 'parrot-release-publication-v0'), false);
run('repo-case', valid.replace(repo, 'A'.repeat(40)), false);
run('artifact-length', valid.replace(artifact, 'b'.repeat(63)), false);
run('ready-nonhex', valid.replace(ready, 'g'.repeat(64)), false);

console.log('publication record verifier tests PASS');
