((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ParrotRunnerPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 function normalizeUrl(raw){try{const u=new URL(raw);u.search='';u.hash='';return u.toString().replace(/\/$/,'');}catch{return String(raw||'').replace(/[?#].*$/,'').replace(/\/$/,'');}}
 function shouldArm(target,currentUrl){if(!target||target.status!=='running')return false;if(normalizeUrl(target.url)!==normalizeUrl(currentUrl))return false;if(target.mode==='interval')return true;if(target.mode==='response')return target.sendImmediately!==false;return false;}
 return Object.freeze({normalizeUrl,shouldArm});
});
