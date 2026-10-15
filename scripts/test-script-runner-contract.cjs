'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const extension=path.resolve(__dirname,'../extension');
function read(file){return fs.readFileSync(path.join(extension,file),'utf8')}
test('vNext has an explicit Chrome userScripts opt-in and no new external host access',()=>{
 const m=JSON.parse(read('manifest.json'));
 assert.equal(m.version,'0.9.0');assert.equal(m.minimum_chrome_version,'135');
 assert(m.permissions.includes('userScripts'));assert.deepEqual(m.host_permissions,['https://chatgpt.com/*']);
});
test('runner is opt-in; background dispatch limited to extension manager',()=>{
 const b=read('script-runner-background.js'),r=read('script-runner-runtime.js');
 assert(b.includes('PARROT_USER_SCRIPT_REQUEST'));
 assert(r.includes("sender.url!==expectedPage"));
 assert(r.includes("sender.tab"));
 assert(r.includes("cmd.uiAction!==true"));
 assert(r.includes("world:'USER_SCRIPT'"));
 assert(r.includes("userScripts.execute"));
});
test('automatic relay does not wire user text or parrot.invalid to code execution',()=>{
 const b=read('background.js');
 assert(b.includes("importScripts('script-runner-policy.js','script-runner-runtime.js','script-runner-background.js')"));
 const s=read('signal-scanner.js'),p=read('signal-protocol.js');
 assert(!s.includes('PARROT_USER_SCRIPT_REQUEST'));
 assert(!p.includes("kind: 'execute'"));
 assert(!b.includes("handleSignal(href,sourceUrl){await userScripts"));
});
test('the script manager includes explicit save, consent, and manual run',()=>{
 const html=read('script-runner.html'),ui=read('script-runner-ui.js');
 for(const key of ['save','approve','disable','run','status'])assert(html.includes('id="'+key+'"'));
 assert(ui.includes("if(!confirm("));
 assert(ui.includes("chrome.tabs.query"));
 assert(!ui.includes("new Function("));assert(!ui.includes("eval("));
});
test('old Parrot popup entrypoint remains alongside experiment',()=>{
 const html=read('popup.html'),js=read('popup.js');
 assert(html.includes('id="dashboard"'));assert(html.includes('id="scriptRunner"'));
 assert(js.includes("script-runner.html"));assert(js.includes("chrome.tabs.create"));
});
