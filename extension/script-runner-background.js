/* Script Runner bridge: isolated optional feature, no ChatGPT signal auto-execution. */
(()=>{
 'use strict';
 const api=ParrotScriptRunnerRuntime.create({
  policy:ParrotScriptRunnerPolicy,storage:chrome.storage.local,
  tabs:chrome.tabs,userScripts:chrome.userScripts,cryptoApi:crypto,
  now:Date.now,expectedPage:chrome.runtime.getURL('script-runner.html')
 });
 chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(message?.type!=='PARROT_USER_SCRIPT_REQUEST')return false;
  api.handle(message.request,sender).then(sendResponse).catch(e=>{
   const known=['CATALOG_INTEGRITY_INVALID','STORAGE_INVALID','HASH_UNAVAILABLE'];
   const code=known.includes(e?.message)?e.message:'SCRIPT_OPERATION_FAILED';
   sendResponse({ok:false,reason:code});
  });
  return true;
 });
})();