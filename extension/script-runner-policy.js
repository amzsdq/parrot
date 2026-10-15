/* Parrot vNext opt-in user script policy. No auto-execution from chat/URL. */
((root,factory)=>{
 const api=factory();
 if(typeof module==='object'&&module.exports) module.exports=api;
 else root.ParrotScriptRunnerPolicy=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const ORIGINS=Object.freeze(['https://chatgpt.com']);
 const MAX_CODE_BYTES=16384,MAX_SCRIPTS=20;
 const VALID_ID=/^ps-[a-f0-9]{64}$/;
 const VALID_HEX=/^[a-f0-9]{64}$/;
 const encode=new TextEncoder();
 function targetUrl(value) {
  if(typeof value!=='string'||value.length>1024)return null;
  let url;try{url=new URL(value)}catch{return null}
  if(!ORIGINS.includes(url.origin)||url.username||url.password||url.hash)return null;
  if(!/^\/(?:c\/[a-f0-9-]{36}|g\/[a-z0-9-]+\/c\/[a-f0-9-]{36})\/?$/.test(url.pathname))return null;
  return url.origin+url.pathname.replace(/\/$/,'');
 }
 function spec({name,source,conversationUrl}={}) {
  const target=targetUrl(conversationUrl);
  if(!target)throw Error('EXACT_TARGET_REQUIRED');
  if(typeof name!=='string'||!/^[a-zA-Z0-9 _-]{1,50}$/.test(name))throw Error('SCRIPT_NAME_INVALID');
  if(typeof source!=='string'||!source.trim()||encode.encode(source).length>MAX_CODE_BYTES||
     source.includes('\0'))throw Error('SCRIPT_SOURCE_INVALID');
  return {name,source,conversationUrl:target};
 }
 async function hashSource(source,cryptoApi) {
  if(typeof source!=='string'||!cryptoApi?.subtle?.digest)throw Error('HASH_UNAVAILABLE');
  const bytes=new Uint8Array(await cryptoApi.subtle.digest('SHA-256',encode.encode(source)));
  return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
 }
 async function createRecord(candidate,cryptoApi,now=Date.now()) {
  const x=spec(candidate),sha256=await hashSource(x.source,cryptoApi);
  if(!Number.isSafeInteger(now)||now<=0)throw Error('CLOCK_INVALID');
  return Object.freeze({schema:1,id:'ps-'+sha256,sha256,name:x.name,source:x.source,
   conversationUrl:x.conversationUrl,createdAt:now,enabled:false,approvedAt:null});
 }
 function validateRecord(record) {
  if(!record||record.schema!==1||!VALID_ID.test(record.id)||!VALID_HEX.test(record.sha256)||
    record.id!=='ps-'+record.sha256||!Number.isSafeInteger(record.createdAt)||
    ![true,false].includes(record.enabled)||typeof record.source!=='string'||!record.source.trim()||
    encode.encode(record.source).length>MAX_CODE_BYTES||
    !targetUrl(record.conversationUrl)||record.conversationUrl!==targetUrl(record.conversationUrl))return false;
  try{spec(record)}catch{return false}
  return true;
 }
 function decideRun({record,request,tab,sourceHash,now=Date.now()}={}) {
  if(!validateRecord(record)||sourceHash!==record.sha256)return {ok:false,reason:'SCRIPT_DIGEST_MISMATCH'};
  if(!record.enabled||!Number.isSafeInteger(record.approvedAt)||record.approvedAt<record.createdAt)
   return {ok:false,reason:'SCRIPT_NOT_APPROVED'};
  if(request?.fromExtensionUI!==true||request?.userGesture!==true||request?.manualRun!==true)
   return {ok:false,reason:'EXPLICIT_USER_GESTURE_REQUIRED'};
  if(request.scriptId!==record.id||!Number.isSafeInteger(request.tabId)||request.tabId<1||
     request.tabId!==tab?.id)return {ok:false,reason:'TARGET_TAB_ID_MISMATCH'};
  if(targetUrl(tab?.url)!==record.conversationUrl||
     targetUrl(request.conversationUrl)!==record.conversationUrl)
   return {ok:false,reason:'EXACT_CONVERSATION_MISMATCH'};
  if(tab?.status!=='complete'||tab?.incognito===true)
   return {ok:false,reason:'TAB_NOT_READY'};
  if(!Number.isSafeInteger(now)||now<record.approvedAt)return {ok:false,reason:'CLOCK_INVALID'};
  return {ok:true,scriptId:record.id,tabId:tab.id,executionWorld:'USER_SCRIPT',
   requireChromeUserScripts:true,sourceSha256:record.sha256};
 }
 function parseReference(url) {
  // A marker is a request to find a PREVIOUSLY approved preset, never executable code.
  if(typeof url!=='string'||url.length>512)return null;
  let parsed;try{parsed=new URL(url)}catch{return null}
  if(parsed.origin!=='https://parrot.invalid'||parsed.username||parsed.password||
     parsed.hash||parsed.search||parsed.pathname.includes('%'))return null;
  const parts=parsed.pathname.split('/').filter(Boolean);
  if(parts.length!==2||parts[0]!=='preset'||!VALID_ID.test(parts[1]))return null;
  return Object.freeze({kind:'preset_reference',scriptId:parts[1],authorized:false});
 }
 return Object.freeze({MAX_CODE_BYTES,MAX_SCRIPTS,targetUrl,spec,hashSource,
  createRecord,validateRecord,decideRun,parseReference});
});