import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('../extension/chatgpt-adapter.js',import.meta.url),'utf8');
function boot(nodes={},lists={}){const document={title:'ChatGPT',querySelector(sel){return nodes[sel]||null;},querySelectorAll(sel){return lists[sel]||[];}};const ctx={location:{hostname:'chatgpt.com'},document,globalThis:null,HTMLTextAreaElement:class{},HTMLInputElement:class{},Event:class{},InputEvent:class{}};ctx.globalThis=ctx;vm.runInNewContext(source,ctx);return ctx.ParrotSiteAdapter;}
let a=boot({'[data-testid="rate-limit-error"]':{getAttribute(){return null;}}});assert.equal(a.classifyCooldown().kind,'rate_limit');
a=boot({'[data-error-code="server_error"]':{getAttribute(){return'server_error';}}});assert.deepEqual({...a.classifyCooldown()},{kind:'transient',code:'server_error',selector:'[data-error-code="server_error"]'});
a=boot({'[data-message-author-role="assistant"]':{textContent:'Too many requests',getAttribute(){return null;}}});assert.equal(a.classifyCooldown(),null);
assert.equal(/textContent|innerText/.test(source.slice(source.indexOf('classifyCooldown'),source.indexOf('getComposer'))),false);
a=boot({'[data-content-search-turn-key] [role="status"][aria-busy="true"]':{}});assert.equal(a.isGenerating(),true);
const submit={disabled:false,getAttribute(){return null;}},form={querySelector(sel){return sel==='button[type="submit"]'?submit:null;}},composer={closest(sel){return sel==='form'?form:null;}};
a=boot({'div.ProseMirror[contenteditable="true"]':composer});assert.equal(a.getSendButton(),submit);
a=boot({}, {'[data-message-author-role="user"], [data-user-message-bubble="true"]':[{},{}]});assert.equal(a.getUserMessageCount(),2);
console.log('PASS: structural cooldown + current ChatGPT live DOM compatibility boundaries');
