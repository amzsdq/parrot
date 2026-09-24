((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ParrotRunnerRegistry=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 function create(tokenFactory=()=>crypto.randomUUID()){
  const tokens=new Map(),modes=new Map();
  function claim(id,mode){const token=tokenFactory();tokens.set(id,token);modes.set(id,mode);return token;}
  function isCurrent(id,token){return tokens.get(id)===token;}
  function release(id,token){if(!isCurrent(id,token))return false;tokens.delete(id);modes.delete(id);return true;}
  function startIfIdle(id,mode,launch){if(tokens.has(id))return false;const token=claim(id,mode);try{launch(token);}catch(e){release(id,token);throw e;}return true;}
  function prune(targets){const byId=new Map((Array.isArray(targets)?targets:[]).map(t=>[t.id,t]));for(const[id]of tokens){const t=byId.get(id);if(!t||t.status!=='running'||modes.get(id)!==t.mode){tokens.delete(id);modes.delete(id);}}}
  function snapshot(id){return tokens.has(id)?{token:tokens.get(id),mode:modes.get(id)}:null;}
  return Object.freeze({claim,isCurrent,release,startIfIdle,prune,snapshot});
 }
 return Object.freeze({create});
});
