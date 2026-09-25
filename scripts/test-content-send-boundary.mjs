import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../extension/content.js',import.meta.url),'utf8');
let target={id:'t',url:'https://chatgpt.com/c/test',prompt:'probe',mode:'response',delaySec:0,maxRepeats:1,status:'stopped',sentCount:0,cooldownEnabled:false};
let onMessage=null,buttonPolls=0,clicks=0,userCount=0,generationReads=0,active=false;
const storage={parrotTargets:[target],parrotAmbiguityOutbox:[]};
const chrome={
  storage:{
    local:{
      async get(key){if(Array.isArray(key))return Object.fromEntries(key.map(k=>[k,storage[k]]));return typeof key==='string'?{[key]:storage[key]}:{...storage};},
      async set(patch){Object.assign(storage,patch);}
    },
    onChanged:{addListener(){}}
  },
  runtime:{onMessage:{addListener(fn){onMessage=fn;}},async sendMessage(){return{ack:true};}}
};
const adapter={
  matches(){return true;},
  classifyCooldown(){return null;},
  isGenerating(){if(!clicks)return false;generationReads++;return generationReads<=2;},
  getUserMessageCount(){return userCount;},
  setComposerText(){return true;},
  getSendButton(){buttonPolls++;if(buttonPolls<4)return null;return{disabled:false,getAttribute(){return null;},click(){clicks++;userCount++;}};}
};
const registry={create(){return{
  startIfIdle(_id,_mode,fn){if(active)return false;active=true;Promise.resolve(fn('tok'));return true;},
  isCurrent(){return active;},
  release(){active=false;},
  prune(){}
};}};
const ctx={
  chrome,globalThis:null,ParrotSiteAdapter:adapter,ParrotRunnerRegistry:registry,
  ParrotRouteState:{classifyStrongReceipt({beforeUserCount,afterUserCount,generating}){return afterUserCount>beforeUserCount||generating?'delivered':'unconfirmed';},putAmbiguityReceipt(a){return a;},ackAmbiguityReceipt(a){return a;},canAutoDispatch(){return false;},sanitizeAmbiguityReceipt(x){return x;}},
  ParrotRepeatPolicy:{stopReason(t){return Number(t.sentCount||0)>=1?'max_repeats':null;},cooldownDue(){return true;},nextCooldown(){return{kind:'',attempt:0,until:0,minutes:0};},intervalDue(){return true;}},
  ParrotRunnerPolicy:{shouldArm(){return false;},autoArmDelayMs(){return 0;}},
  ParrotPromptCompose:{compose(t){return t.prompt;}},
  setTimeout,clearTimeout,Date,Promise,console
};
ctx.globalThis=ctx;
vm.runInNewContext(source,ctx);
assert.equal(typeof onMessage,'function');
storage.parrotTargets[0]={...storage.parrotTargets[0],status:'running'};
const start=await new Promise(resolve=>onMessage({type:'PARROT_START',targetId:'t'},null,resolve));
assert.equal(start.ok,true);
const deadline=Date.now()+1200;
while(Date.now()<deadline&&storage.parrotTargets[0].sentCount!==1)await new Promise(r=>setTimeout(r,25));
assert.equal(storage.parrotTargets[0].sentCount,1,'delayed submit control must still be clicked and strongly receipted');
assert.ok(buttonPolls>=4,'runner must poll until delayed submit control appears');
assert.equal(clicks,1);
const stopDeadline=Date.now()+400;
while(Date.now()<stopDeadline&&storage.parrotTargets[0].status!=='stopped')await new Promise(r=>setTimeout(r,20));
assert.equal(storage.parrotTargets[0].stopReason,'max_repeats');
console.log('PASS: delayed ChatGPT submit control is awaited and strong receipt completes once');
