((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ParrotDashboardModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 function hasCooldown(t,now=Date.now()){return t?.cooldownEnabled!==false&&Number(t?.cooldownUntil||0)>now;}
 function isAttention(w,now=Date.now()){return['discarded','frozen'].includes(w?.structure?.structuralState)||Boolean(w?.target?.lastError)||hasCooldown(w?.target,now);}
 function filterWorkers(workers,{query='',filter='all',now=Date.now()}={}){const q=String(query).trim().toLowerCase();return(Array.isArray(workers)?workers:[]).filter(w=>{const t=w.target||{},hay=[t.workerLabel,t.title,t.routeKey,t.url].join(' ').toLowerCase();if(q&&!hay.includes(q))return false;if(filter==='open'&&!w.tab)return false;if(filter==='running'&&t.status!=='running')return false;if(filter==='attention'&&!isAttention(w,now))return false;return true;});}
 function pageWorkers(workers,page=0,size=25){const n=Math.max(1,Number(size)||25),pages=Math.max(1,Math.ceil(workers.length/n)),p=Math.max(0,Math.min(Number(page)||0,pages-1)),start=p*n;return{page:p,pages,size:n,total:workers.length,start:workers.length?start+1:0,end:Math.min(workers.length,start+n),items:workers.slice(start,start+n)};}
 return Object.freeze({hasCooldown,isAttention,filterWorkers,pageWorkers});
});
