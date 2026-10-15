'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const p=require('../extension/script-runner-policy.js');
const id='6acb9ad6-ce68-83ee-af68-3c33609f9a87';
const url='https://chatgpt.com/c/'+id;
const base=()=>({name:'demo',source:'document.title;',conversationUrl:url});
async function approved(){const r=await p.createRecord(base(),webcrypto,100);return {...r,approvedAt:110,enabled:true}}
const request=r=>({fromExtensionUI:true,userGesture:true,manualRun:true,scriptId:r.id,tabId:7,conversationUrl:url});
const tab={id:7,url,status:'complete',incognito:false};
test('content-addressed script ID and opt-in default',async()=>{
 const a=await p.createRecord(base(),webcrypto,100);
 assert.match(a.id,/^ps-[a-f0-9]{64}$/);assert.equal(a.enabled,false);
 assert.equal(a.approvedAt,null);assert(Object.isFrozen(a));
});
test('allowed target is exact ChatGPT conversation, never auth or home',()=>{
 assert.equal(p.targetUrl(url),url);
 for(const str of ['https://chatgpt.com/','https://chatgpt.com/auth/login',
 'https://chatgpt.com.evil.example/c/'+id,
 'https://claude.ai/chat/'+id,'http://chatgpt.com/c/'+id,
 'https://chatgpt.com/c/'+id+'#fragment']){
  assert.equal(p.targetUrl(str),null,str);
 }
});
test('arbitrary code is not executed during record creation',async()=>{
 globalThis.__parrot_test_leak=0;
 const r=await p.createRecord({...base(),source:'globalThis.__parrot_test_leak=123'},webcrypto,100);
 assert.equal(globalThis.__parrot_test_leak,0);assert.equal(r.enabled,false);
});
test('only approved direct extension UI gesture may run',async()=>{
 const r=await approved(),hash=await p.hashSource(r.source,webcrypto);
 const d=p.decideRun({record:r,request:request(r),tab,sourceHash:hash,now:120});
 assert.equal(d.ok,true);assert.equal(d.executionWorld,'USER_SCRIPT');
 for(const key of ['userGesture','fromExtensionUI','manualRun']){
  const no={...request(r),[key]:false};
  assert.equal(p.decideRun({record:r,request:no,tab,sourceHash:hash,now:120}).ok,false);
 }
});
test('wrong tab, incognito, auth or different conversation fail closed',async()=>{
 const r=await approved(),hash=await p.hashSource(r.source,webcrypto);
 for(const t of [{...tab,id:8},{...tab,status:'loading'},{...tab,incognito:true},
 {...tab,url:'https://chatgpt.com/c/ca3b9ad6-ce68-83ee-af68-3c33609f9a87'}]){
  assert.equal(p.decideRun({record:r,request:request(r),tab:t,sourceHash:hash,now:120}).ok,false);
 }
});
test('source mismatch or unapproved record cannot run',async()=>{
 const r=await approved();
 assert.equal(p.decideRun({record:r,request:request(r),tab,sourceHash:'f'.repeat(64),now:120}).ok,false);
 const disabled={...r,enabled:false};
 assert.equal(p.decideRun({record:disabled,request:request(disabled),tab,sourceHash:r.sha256,now:120}).reason,'SCRIPT_NOT_APPROVED');
});
test('oversized, empty, NUL and noncanonical source rejected',async()=>{
 for(const s of ['', 'a'.repeat(p.MAX_CODE_BYTES+1), 'alert(1)\0']){
  await assert.rejects(p.createRecord({...base(),source:s},webcrypto,100));
 }
});
test('parrot URL is a non-executing preset reference, not code',async()=>{
 const r=await approved();
 const m=p.parseReference('https://parrot.invalid/preset/'+r.id);
 assert.equal(m.authorized,false);assert.equal(m.scriptId,r.id);
 for(const val of ['https://parrot.invalid/code/alert(1)',
  'https://parrot.invalid/preset/'+r.id+'?execute=true',
  'https://parrot.invalid/preset/'+r.id+'#execute',
  'https://evil.parrot.invalid/preset/'+r.id]){
  assert.equal(p.parseReference(val),null);
 }
});
