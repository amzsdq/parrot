((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ParrotPromptCompose = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const SIGNAL='https://parrot.invalid';
  const token=(template,values)=>String(template||'').replace(/\{\{([A-Z_]+)\}\}/g,(_m,key)=>values[key]??'');
  const routeKey=(target)=>String(target?.routeKey||target?.workerLabel||target?.id||'').trim();
  function targetDirectory(targets){return (targets||[]).map(t=>`${t.workerLabel||'?'}: ${routeKey(t)}`).join('\n');}
  function onboarding(target,targets){
    if(target?.routingEnabled===false||target?.onboardingEnabled===false||!target?.runId)return'';
    const run=encodeURIComponent(target.runId),self=routeKey(target);
    return token(target.onboardingTemplate,{SELF:self,WAKE_URL:`${SIGNAL}/wake/${run}/<EVENT_ID>?to=<TARGET_ROUTE_ID>`,MESSAGE_URL:`${SIGNAL}/message/${run}/<EVENT_ID>?to=<TARGET_ROUTE_ID>&ref=<REFERENCE>`,TARGETS:targetDirectory(targets)}).trim();
  }
  function completion(target){
    if(target?.completionEnabled===false||target?.appendCompletionInstruction===false||!target?.runId)return'';
    const url=target.completionSignalUrl||`${SIGNAL}/complete/${encodeURIComponent(target.runId)}`;
    return token(target.completionInstructionTemplate,{SIGNAL_URL:url}).trim();
  }
  function compose(target,targets,{firstSend=false}={}){
    const parts=[String(target?.prompt||'').trim()];
    if(firstSend){const intro=onboarding(target,targets);if(intro)parts.push(intro);}
    const done=completion(target);if(done)parts.push(done);
    return parts.filter(Boolean).join('\n\n');
  }
  return Object.freeze({routeKey,targetDirectory,onboarding,completion,compose});
});
