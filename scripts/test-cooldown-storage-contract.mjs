import assert from 'node:assert/strict';import fs from'node:fs';
const content=fs.readFileSync(new URL('../extension/content.js',import.meta.url),'utf8'),popup=fs.readFileSync(new URL('../extension/popup.js',import.meta.url),'utf8');
assert.match(popup,/cooldownEnabled:\s*true/);assert.match(popup,/cooldownStep:\s*0/);assert.match(popup,/cooldownUntil:\s*null/);
assert.match(content,/cooldownEnabled===false/);assert.match(content,/cooldownStep:\s*next\.attempt/);assert.match(content,/cooldownStep:\s*0/);assert.match(content,/cooldownStep\?\?target\.cooldownAttempt/);
assert.match(content,/sendPrompt\(await composeTargetPrompt\(t\),t\.cooldownEnabled!==false\)/);
console.log('PASS: cooldown storage compatibility contract');
