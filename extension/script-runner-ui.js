(() => {
 'use strict';
 const $=x=>document.getElementById(x);
 const policy=globalThis.ParrotScriptRunnerPolicy;
 let records=[];
 const put=text=>{$('status').textContent=String(text||'');};
 async function call(action,extras={}){
  const response=await chrome.runtime.sendMessage({type:'PARROT_USER_SCRIPT_REQUEST',
   request:{action,uiAction:true,...extras}});
  if(!response?.ok)throw Error(response?.reason||'REQUEST_NOT_COMPLETED');
  return response;
 }
 const selected=()=>records.find(x=>x.id===$('saved').value)||null;
 async function refresh(){
  const result=await call('list');
  records=result.scripts;
  const keep=$('saved').value;
  $('saved').replaceChildren(new Option('새 스크립트',''));
  for(const x of records)$('saved').add(new Option((x.enabled?'승인됨 · ':'비활성 · ')+x.name+' · '+x.id.slice(3,11),x.id));
  if(records.some(x=>x.id===keep))$('saved').value=keep;
 }
 $('saved').onchange=()=>{
  const s=selected();if(!s)return;
  $('name').value=s.name;$('target').value=s.conversationUrl;$('source').value=s.source;
  put((s.enabled?'승인됨':'미승인')+' · SHA256 '+s.sha256);
 };
 $('save').onclick=async()=>{
  try{
   const out=await call('save',{script:{name:$('name').value,conversationUrl:$('target').value,source:$('source').value}});
   await refresh();$('saved').value=out.script.id;put('저장됨 (아직 실행 불가) · SHA256 '+out.script.sha256);
  }catch(e){put('저장 실패: '+e.message)}
 };
 $('approve').onclick=async()=>{
  const s=selected();if(!s){put('먼저 저장된 스크립트를 선택하세요.');return}
  if($('source').value!==s.source||$('target').value!==s.conversationUrl){put('저장된 코드와 화면 내용이 다릅니다. 먼저 저장하세요.');return}
  if(!confirm('표시된 JavaScript를 지정한 대화 페이지에서 수동 실행할 수 있도록 승인할까요?\n\n'+s.name+'\nSHA256 '+s.sha256))return;
  try{const out=await call('approve',{scriptId:s.id,confirmSha:s.sha256,consent:true});
   await refresh();$('saved').value=out.script.id;put('승인됨 · '+s.name);
  }catch(e){put('승인 실패: '+e.message)}
 };
 $('disable').onclick=async()=>{
  const s=selected();if(!s)return;
  if(!confirm('이 스크립트의 추가 실행을 중지할까요?'))return;
  try{await call('disable',{scriptId:s.id,consent:true});await refresh();$('saved').value=s.id;put('비활성화 완료');}
  catch(e){put('비활성화 실패: '+e.message)}
 };
 $('run').onclick=async()=>{
  const s=selected();if(!s?.enabled){put('승인된 스크립트를 선택하세요.');return}
  if($('source').value!==s.source||$('target').value!==s.conversationUrl){put('현재 코드가 저장본과 다릅니다. 실행 차단.');return}
  const target=policy.targetUrl(s.conversationUrl);
  if(!target){put('잘못된 대화 URL');return}
  try{
   const tabs=await chrome.tabs.query({url:'https://chatgpt.com/*'});
   const matches=tabs.filter(t=>policy.targetUrl(t.url)===target&&t.status==='complete'&&!t.incognito);
   if(matches.length!==1){put('정확히 일치하는 열린 대화 탭이 하나여야 합니다. 발견: '+matches.length);return}
   if(!confirm('현재 열린 한 개의 ChatGPT 대화 탭에서 다음 스크립트를 한 번 실행할까요?\n'+s.name+'\n'+target))return;
   const attemptId=crypto.randomUUID();
   const out=await call('execute',{scriptId:s.id,tabId:matches[0].id,conversationUrl:target,
    attemptId,userGesture:true,manualRun:true});
   put('실행기 응답: '+out.state+'\n고유 시도 ID: '+attemptId+'\n실제 페이지 효과 확인은 별도입니다.');
  }catch(e){put('실행 실패/불확실: '+e.message+'\n동일 시도 자동 재실행하지 않습니다.')}
 };
 refresh().then(()=>put('준비됨 · 기본 자동실행 비활성')).catch(e=>put('초기화 실패: '+e.message));
})();
