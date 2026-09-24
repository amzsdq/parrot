((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ParrotRepeatPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const RATE=[10,20,40,60],TRANSIENT=[2,5,10,20];
 function cooldownMinutes(kind,attempt=0){const ladder=kind==='rate_limit'?RATE:TRANSIENT;return ladder[Math.min(Math.max(0,Number(attempt)||0),ladder.length-1)];}
 function cooldownDue(target,now=Date.now()){return !Number(target?.cooldownUntil||0)||now>=Number(target.cooldownUntil);}
 function nextCooldown(kind,attempt=0,now=Date.now()){const minutes=cooldownMinutes(kind,attempt);return{kind,attempt:Math.max(0,Number(attempt)||0)+1,minutes,until:now+minutes*60000};}
 function stopReason(target,now=Date.now()){
  if(!target||target.status!=='running')return'not_running';
  if(Number(target.maxRepeats)>0&&Number(target.sentCount||0)>=Number(target.maxRepeats))return'max_repeats';
  if(Number(target.runtimeMin)>0&&Number(target.startedAt)>0&&now-Number(target.startedAt)>=Number(target.runtimeMin)*60000)return'runtime_limit';
  return'';
 }
 function intervalDue(target,now=Date.now()){
  if(stopReason(target,now)||!cooldownDue(target,now))return false;
  const intervalMs=Math.max(1,Number(target.intervalMin)||1)*60000;
  const last=Number(target.lastSentAt||target.startedAt||0);
  return !last||now-last>=intervalMs;
 }
 return Object.freeze({cooldownMinutes,cooldownDue,nextCooldown,stopReason,intervalDue,RATE_LIMIT_MINUTES:Object.freeze([...RATE]),TRANSIENT_MINUTES:Object.freeze([...TRANSIENT])});
});
