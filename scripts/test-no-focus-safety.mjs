import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../extension/chatgpt-adapter.js',import.meta.url),'utf8');
class TextArea {
 constructor(){this._value='';this.focusCalls=0;this.focusOptions=[];this.events=[];}
 get value(){return this._value;}
 set value(v){this._value=v;}
 focus(opts){this.focusCalls++;this.focusOptions.push(opts);}
 dispatchEvent(event){this.events.push(event.type);}
}
class Input {}
const area=new TextArea(),doc={
 visibilityState:'visible',
 querySelector(selector){return selector==='#prompt-textarea'?area:null}
};
const exposed={},ctx={
 globalThis:exposed,
 location:{hostname:'chatgpt.com'},
 document:doc,
 HTMLTextAreaElement:TextArea,HTMLInputElement:Input,
 Event:class {constructor(type){this.type=type}},
 InputEvent:class {constructor(type){this.type=type}}
};
vm.runInNewContext(source,ctx);
const adapter=exposed.ParrotSiteAdapter;
assert.equal(adapter.matches(),true);
assert.equal(adapter.setComposerText('DO_NOT_SEND_VISIBLE'),false,
 'active user tab must reject programmatic draft insertion');
assert.equal(area.focusCalls,0,'active user tab must never receive focus');
assert.equal(area.value,'','active user draft must remain intact');
doc.visibilityState='hidden';
assert.equal(adapter.setComposerText('SYNTHETIC_BACKGROUND_ONLY'),true);
assert.equal(area.value,'SYNTHETIC_BACKGROUND_ONLY');
assert.equal(area.focusCalls,1,'one background focus permitted only for editor insertion');
assert.equal(area.focusOptions[0].preventScroll,true,'background focus must not scroll');
doc.visibilityState='visible';
assert.equal(adapter.setComposerText('DO_NOT_SEND_AFTER_VISIBILITY_CHANGE'),false);
assert.equal(area.focusCalls,1,'visibility change cannot refocus');
assert.equal(area.value,'SYNTHETIC_BACKGROUND_ONLY','visibility change cannot replace draft');
console.log('PASS Parrot foreground focus denied, background preventScroll and visibility transitions guarded');
