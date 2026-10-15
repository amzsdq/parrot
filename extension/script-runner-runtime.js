/* Parrot experimental USER_SCRIPT runner — manual, content-addressed, fail closed. */
((root,factory)=>{
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ParrotScriptRunnerRuntime=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const CATALOG='parrotUserScriptsV1',RECEIPTS='parrotUserScriptAttemptsV1';
 const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
 function create({policy,storage,tabs,userScripts,cryptoApi,now=Date.now,expectedPage}={}){
  if(!policy||!storage?.get||!storage?.set||!tabs?.get||!cryptoApi?.subtle||typeof expectedPage!=='string')
   throw Error('RUNNER_DEPENDENCY_INVALID');
  let chain=Promise.resolve();
  function serial(fn){const call=chain.then(fn);chain=call.catch(()=>{});return call;}
  async function load(key,max){const x=(await storage.get(key))[key];if(x===undefined)return [];
   if(!Array.isArray(x)||x.length>max)throw Error('STORAGE_INVALID');return x;}
  const project=x=>({id:x.id,name:x.name,source:x.source,conversationUrl:x.conversationUrl,enabled:x.enabled,
    approvedAt:x.approvedAt,sha256:x.sha256,bytes:new TextEncoder().encode(x.source).length});
  return Object.freeze({handle:(cmd,sender)=>{
   if(!sender||sender.tab||sender.url!==expectedPage||cmd?.uiAction!==true)
    return Promise.resolve({ok:false,reason:'EXTENSION_PAGE_ONLY'});
   return serial(async()=>{
    const list=await load(CATALOG,policy.MAX_SCRIPTS);
    if(list.some(x=>!policy.validateRecord(x)))throw Error('CATALOG_INTEGRITY_INVALID');
    if(cmd.action==='list')return {ok:true,scripts:list.map(project)};
    if(cmd.action==='save'){
     const rec=await policy.createRecord(cmd.script,cryptoApi,now());
     if(list.length>=policy.MAX_SCRIPTS)return {ok:false,reason:'CATALOG_FULL'};
     if(list.some(x=>x.id===rec.id))return {ok:false,reason:'ALREADY_SAVED'};
     await storage.set({[CATALOG]:[...list,rec]});return {ok:true,script:project(rec)};
    }
    const rec=list.find(x=>x.id===cmd.scriptId);
    if(!rec)return {ok:false,reason:'PRESET_NOT_FOUND'};
    const digest=await policy.hashSource(rec.source,cryptoApi);
    if(digest!==rec.sha256)return {ok:false,reason:'SCRIPT_HASH_MISMATCH'};
    if(cmd.action==='approve'){
     if(cmd.consent!==true||cmd.confirmSha!==rec.sha256)return {ok:false,reason:'MANUAL_APPROVAL_REQUIRED'};
     const patched={...rec,enabled:true,approvedAt:Math.max(now(),rec.createdAt)};
     await storage.set({[CATALOG]:list.map(x=>x.id===rec.id?patched:x)});
     return {ok:true,script:project(patched)};
    }
    if(cmd.action==='disable'){
     if(cmd.consent!==true)return {ok:false,reason:'MANUAL_APPROVAL_REQUIRED'};
     const patched={...rec,enabled:false};
     await storage.set({[CATALOG]:list.map(x=>x.id===rec.id?patched:x)});
     return {ok:true,script:project(patched)};
    }
    if(cmd.action!=='execute')return {ok:false,reason:'ACTION_UNSUPPORTED'};
    if(!UUID.test(cmd.attemptId))return {ok:false,reason:'INVALID_ATTEMPT'};
    let tab;try{tab=await tabs.get(cmd.tabId)}catch{return {ok:false,reason:'TAB_UNAVAILABLE'};}
    const d=policy.decideRun({record:rec,request:{
      fromExtensionUI:true,userGesture:cmd.userGesture===true,manualRun:cmd.manualRun===true,
      scriptId:cmd.scriptId,tabId:cmd.tabId,conversationUrl:cmd.conversationUrl
    },tab,sourceHash:digest,now:now()});
    if(!d.ok)return d;
    const receipts=await load(RECEIPTS,100);
    if(receipts.some(x=>x.attemptId===cmd.attemptId))return {ok:false,reason:'ATTEMPT_RECORDED'};
    if(typeof userScripts?.execute!=='function')return {ok:false,reason:'USER_SCRIPTS_NOT_ENABLED'};
    await storage.set({[RECEIPTS]:[...receipts,{attemptId:cmd.attemptId,scriptId:rec.id,
      state:'DISPATCH_STARTED',at:now()}].slice(-100)});
    let state='UNKNOWN';
    try{
     const results=await userScripts.execute({target:{tabId:tab.id,allFrames:false},
      js:[{code:rec.source}],world:'USER_SCRIPT'});
     state=Array.isArray(results)&&results.length>0&&results.every(x=>!x.error)?'API_RETURNED':'ERROR';
    }catch{state='UNKNOWN';}
    const latest=await load(RECEIPTS,100);
    await storage.set({[RECEIPTS]:latest.map(x=>x.attemptId===cmd.attemptId?{...x,state,endedAt:now()}:x)});
    return {ok:state==='API_RETURNED',state,attemptId:cmd.attemptId,effectVerified:false};
   });
  }});
 }
 return Object.freeze({create,CATALOG,RECEIPTS});
});