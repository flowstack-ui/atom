import { JSDOM } from "jsdom";
import { assert, test, React } from "../test-utils.mjs";
import { Reorder } from "../../dist/reorder.js";
import { resolveActivation } from "../../dist/_internal/primitives/drag-drop/options.js";

test("activation defaults and invalid values are deterministic", () => {
  assert.deepEqual(resolveActivation(), {distance:6,touchDelay:220,touchTolerance:8});
  assert.equal(resolveActivation({distance:12}).distance,12);
  assert.equal(resolveActivation({distance:undefined}).distance,6);
  for(const value of [-1,NaN,Infinity]) assert.throws(()=>resolveActivation({distance:value}),RangeError);
});

test("pointer threshold, inert preview, lost capture, blur and disabled cleanup", async () => {
  const dom = new JSDOM("<div id='app'></div>",{pretendToBeVisual:true,url:"http://localhost"});
  const names=["window","document","navigator","HTMLElement","Element","Node","IS_REACT_ACT_ENVIRONMENT"];
  const previous=Object.fromEntries(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for(const name of names) Object.defineProperty(globalThis,name,{configurable:true,writable:true,value:name==="IS_REACT_ACT_ENVIRONMENT"?true:dom.window[name]});
  const captures=new WeakMap();
  dom.window.HTMLElement.prototype.setPointerCapture=function(id){captures.set(this,id)};
  dom.window.HTMLElement.prototype.hasPointerCapture=function(id){return captures.get(this)===id};
  dom.window.HTMLElement.prototype.releasePointerCapture=function(){captures.delete(this)};
  const {createRoot}=await import("react-dom/client");
  const root=createRoot(document.getElementById('app'));
  let commits=0;
  const render=(props={})=>React.act(async()=>root.render(React.createElement(Reorder.Root,{
    items:['a','b'],getItemLabel:v=>v,onItemsChange:()=>commits++,autoScroll:false,activation:{distance:12},...props,
  }, ['a','b'].map(value=>React.createElement(Reorder.Item,{key:value,value},React.createElement(Reorder.Handle,{'aria-label':value},value))),
  React.createElement(Reorder.Preview,null,value=>React.createElement('button',null,value)))));
  const pointer=async(type,x=10)=>React.act(async()=>{
    const event=new dom.window.MouseEvent(type,{bubbles:true,cancelable:true,button:0,buttons:1,clientX:x,clientY:10});
    Object.defineProperty(event,'pointerId',{value:1});
    Object.defineProperty(event,'pointerType',{value:'mouse'});
    document.querySelector('button').dispatchEvent(event);
  });
  try {
    await render();
    document.querySelector('li').getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:100,bottom:40,width:100,height:40});
    await pointer('pointerdown'); await pointer('pointermove',20);
    assert.equal(document.querySelector('[data-dragging]'),null); assert.equal(document.querySelector('[data-drag-input]'),null);
    await pointer('pointermove',24);
    assert.equal(document.querySelector('li').getAttribute('data-drag-input'),'pointer');
    assert.equal(document.querySelector('button').getAttribute('data-drag-input'),'pointer');
    const preview=document.querySelector('[data-slot="reorder-preview"]');
    assert.ok(preview); assert.equal(preview.getAttribute('aria-hidden'),'true'); assert.ok(preview.hasAttribute('inert'));
    assert.equal(preview.style.left,'14px'); assert.equal(preview.style.width,'100px');
    await pointer('lostpointercapture'); assert.equal(document.querySelector('[data-dragging]'),null); assert.equal(document.querySelector('[data-drag-input]'),null);
    assert.equal(document.querySelector('[data-slot="reorder-preview"]'),null);
    await pointer('pointerdown'); await pointer('pointermove',24);
    await React.act(async()=>window.dispatchEvent(new window.Event('blur')));
    assert.equal(document.querySelector('[data-dragging]'),null); assert.equal(document.querySelector('[data-drag-input]'),null);
    await pointer('pointerdown'); await pointer('pointermove',24); await render({disabled:true});
    assert.equal(document.querySelector('[data-dragging]'),null); assert.equal(document.querySelector('[data-drag-input]'),null); assert.equal(commits,0);
    assert.ok(document.querySelector('button').hasAttribute('data-disabled'));
    await render();
    await pointer('pointerdown'); await pointer('pointermove',24);
    await render({items:['b','a']});
    assert.equal(document.querySelector('[data-dragging]'),null); assert.equal(document.querySelector('[data-drag-input]'),null);
    assert.equal(commits,0);
    await pointer('pointerdown'); await pointer('pointermove',24);
    assert.equal(document.querySelector('li').getAttribute('data-drag-input'),'pointer');
    await React.act(async()=>root.render(null));
    assert.equal(document.querySelector('[data-drag-input]'),null);
    assert.equal(document.querySelector('[data-slot="reorder-preview"]'),null);
  } finally {
    await React.act(async()=>root.unmount()); dom.window.close();
    for(const name of names) {if(previous[name])Object.defineProperty(globalThis,name,previous[name]);else delete globalThis[name]}
  }
});
