'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const policy=require('../extension/script-runner-policy.js');
const runtime=require('../extension/script-runner-runtime.js');
const exact='https://chatgpt.com/c/6acb9ad6-ce68-83ee-af68-3c33609f9a87';
const attempt='33074055-4a43-4cd6-b3dd-02752706b10a';
function fixture(){
 const values={},injections=[],sender={url:'chrome-extension://abc/script-runner.html'};
 const storage={get:async k=>({[k]:values[k]}),set:async fields=>Object.assign(values,fields)};
 const tabs={get:async id=>({id,url:exact,status:'complete',incognito:false})};
 const userScripts={execute:async args=>{injections.push(args);return [{frameId:0,result:true}]}};
 let clock=100;
 const create=()=>runtime.create({policy,storage,tabs,userScripts,cryptoApi:webcrypto,
  now:()=>++clock,expectedPage:sender.url});
 let manager=create();
 const call=(action,extra={})=>manager.handle({uiAction:true,action,...extra},sender);
 const script={name:'hello',source:'console.log("hello")',conversationUrl:exact};
 return {values,injections,sender,userScripts,storage,tabs,create,call,script,setManager:x=>{manager=x}};
}
async function approved(f){
 const saved=await f.call('save',{script:f.script});assert.equal(saved.ok,true);
 const yes=await f.call('approve',{scriptId:saved.script.id,confirmSha:saved.script.sha256,consent:true});
 assert.equal(yes.ok,true);return yes.script;
}
function command(r){return {scriptId:r.id,tabId:7,attemptId:attempt,conversationUrl:exact,userGesture:true,manualRun:true}}
test('only internal extension page may save code',async()=>{
 const f=fixture();
 const resp=await f.create().handle({uiAction:true,action:'save',script:f.script},{url:'https://chatgpt.com/c/abc',tab:{id:7}});
 assert.equal(resp.reason,'EXTENSION_PAGE_ONLY');assert.equal(f.injections.length,0);
});
test('save/list never executes and default is disabled',async()=>{
 const f=fixture(),save=await f.call('save',{script:f.script});
 assert.equal(save.script.enabled,false);assert.equal(f.injections.length,0);
 assert.equal((await f.call('list')).scripts.length,1);
});
test('approval must match SHA and direct consent',async()=>{
 const f=fixture(),r=(await f.call('save',{script:f.script})).script;
 assert.equal((await f.call('approve',{scriptId:r.id,confirmSha:'f'.repeat(64),consent:true})).ok,false);
 assert.equal((await f.call('approve',{scriptId:r.id,confirmSha:r.sha256,consent:false})).ok,false);
});
test('manual approved exact-tab call executes using USER_SCRIPT world',async()=>{
 const f=fixture(),r=await approved(f);
 const result=await f.call('execute',command(r));
 assert.equal(result.state,'API_RETURNED');assert.equal(result.effectVerified,false);
 assert.equal(f.injections.length,1);assert.equal(f.injections[0].world,'USER_SCRIPT');
 assert.equal(f.injections[0].target.tabId,7);
});
test('same attempt is not retried, including after service-worker reconstruction',async()=>{
 const f=fixture(),r=await approved(f);
 await f.call('execute',command(r));
 f.setManager(f.create());
 const second=await f.call('execute',command(r));
 assert.equal(second.reason,'ATTEMPT_RECORDED');assert.equal(f.injections.length,1);
});
test('unknown execution result preserves durable receipt and refuses duplicate',async()=>{
 const f=fixture(),r=await approved(f);
 f.userScripts.execute=async()=>{throw Error('unknown host outcome')};
 f.setManager(f.create());
 const first=await f.call('execute',command(r));
 assert.equal(first.state,'UNKNOWN');
 assert.equal((await f.call('execute',command(r))).reason,'ATTEMPT_RECORDED');
});
test('source hash tampering and no-click attempt are blocked',async()=>{
 const f=fixture(),r=await approved(f);
 assert.equal((await f.call('execute',{...command(r),userGesture:false})).ok,false);
 f.values[runtime.CATALOG][0].source='console.log("tampered")';
 assert.equal((await f.call('execute',command(r))).reason,'SCRIPT_HASH_MISMATCH');
 assert.equal(f.injections.length,0);
});
test('disable revokes execution until new approval',async()=>{
 const f=fixture(),r=await approved(f);
 assert.equal((await f.call('disable',{scriptId:r.id,consent:true})).ok,true);
 assert.equal((await f.call('execute',command(r))).reason,'SCRIPT_NOT_APPROVED');
});
