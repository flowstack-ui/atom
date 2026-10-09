import { JSDOM } from "jsdom";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Editable, useEditable } from "../../dist/editable.js";
const h=React.createElement;

test("Editable projects structural hosts and live preview content",()=>{
  const html=renderToStaticMarkup(h(Editable.Root,{asChild:true,defaultValue:"Live title"},
    h("section",null,h(Editable.Area,{asChild:true},h("div",null,
      h(Editable.Context,null,({valueText})=>h(Editable.Preview,{asChild:true},h("span",{className:"custom"},valueText))),
      h(Editable.Input,{"aria-label":"Title"}))),h(Editable.Control,{asChild:true},h("nav",null,h(Editable.EditTrigger,null,"Edit"))))));
  assert.match(html,/<section/);assert.match(html,/<nav/);assert.match(html,/class="custom"/);
  assert.match(html,/Live title/);assert.doesNotMatch(html,/asChild/);
  assert.equal((html.match(/data-slot="editable-preview"/g)??[]).length,1);
});

test("Editable SSR has native anatomy, one form value and no leaked options",()=>{
  const html=renderToStaticMarkup(h(Editable.Root,{defaultValue:"Notes",name:"title",activationMode:"dblclick"},h(Editable.Label,null,"Title"),h(Editable.Area,null,h(Editable.Preview),h(Editable.Input)),h(Editable.EditTrigger,null,"Edit")));
  assert.equal((html.match(/<input/g)??[]).length,1);assert.match(html,/name="title"/);assert.match(html,/value="Notes"/);
  assert.match(html,/data-state="preview"/);assert.doesNotMatch(html,/activationMode|defaultEdit|type="hidden"/);
});

async function mounted(run){
  const dom=new JSDOM("<div id='app'></div><button id='outside'>Outside</button>",{pretendToBeVisual:true,url:"http://localhost"});
  const names=["window","document","navigator","HTMLElement","Element","Node","IS_REACT_ACT_ENVIRONMENT"];
  const previous=Object.fromEntries(names.map(n=>[n,globalThis[n]]));
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Element:dom.window.Element,Node:dom.window.Node,IS_REACT_ACT_ENVIRONMENT:true});
  Object.defineProperty(globalThis,"navigator",{value:dom.window.navigator,configurable:true,writable:true});
  const { createRoot } = await import("react-dom/client");
  const root=createRoot(document.getElementById("app"));let api;
  function App({options={},textarea=false}){api=useEditable(options);return h(Editable.RootProvider,{value:api},h(Editable.Label,null,"Title"),h(Editable.Area,null,h(Editable.Preview),h(textarea?Editable.Textarea:Editable.Input)),h(Editable.Control,null,h(Editable.EditTrigger,null,"Edit"),h(Editable.SubmitTrigger,null,"Save"),h(Editable.CancelTrigger,null,"Cancel")));}
  const render=async(options={},textarea=false)=>React.act(async()=>root.render(h(App,{options,textarea})));
  try {await run({render,get api(){return api;},dom});}finally{await React.act(async()=>root.unmount());Object.assign(globalThis,previous);dom.window.close();}
}
test("Editable cancels to empty",async()=>mounted(async context=>{
  await context.render({defaultValue:""});await React.act(async()=>context.api.edit());await React.act(async()=>context.api.setValue("Draft"));
  await React.act(async()=>context.api.cancel());assert.equal(context.api.value,"");assert.equal(context.api.editing,false);
}));
test("Editable defaultEdit rollback keeps initial nonempty value",async()=>mounted(async context=>{
  await context.render({defaultValue:"Original",defaultEdit:true});await React.act(async()=>context.api.setValue("Changed"));
  await React.act(async()=>context.api.cancel());assert.equal(context.api.value,"Original");
}));
test("Editable accepted commit fires once and cancellation never commits",async()=>mounted(async context=>{
  const commits=[],reverts=[];await context.render({defaultValue:"Before",onValueCommit:d=>commits.push(d.value),onValueRevert:d=>reverts.push(d.value)});
  await React.act(async()=>context.api.edit());await React.act(async()=>context.api.setValue("After"));
  await React.act(async()=>{context.api.submit();context.api.submit();});assert.deepEqual(commits,["After"]);
  await React.act(async()=>context.api.edit());await React.act(async()=>context.api.setValue("Discard"));await React.act(async()=>context.api.cancel());
  assert.deepEqual(commits,["After"]);assert.deepEqual(reverts,["After"]);assert.equal(context.api.value,"After");
}));
test("Editable controlled parent refusal does not commit",async()=>mounted(async context=>{
  const changes=[],commits=[];const options={value:"Saved",edit:true,onEditChange:d=>changes.push(d.edit),onValueCommit:d=>commits.push(d.value)};
  await context.render(options);await React.act(async()=>context.api.submit());assert.equal(context.api.editing,true);assert.deepEqual(commits,[]);assert.deepEqual(changes,[false]);
  await context.render({...options,edit:false});assert.deepEqual(commits,["Saved"]);
}));
test("Editable readonly imperative requests cannot mutate",async()=>mounted(async context=>{
  await context.render({defaultValue:"Original",readOnly:true});await React.act(async()=>{context.api.edit();context.api.clearValue();});
  assert.equal(context.api.editing,false);assert.equal(context.api.value,"Original");
}));
test("Editable cancelled outside interaction keeps draft and editing",async()=>mounted(async context=>{
  await context.render({defaultEdit:true,defaultValue:"Original",onInteractOutside:event=>event.preventDefault()});
  await React.act(async()=>context.api.setValue("Draft"));await React.act(async()=>document.getElementById("outside").focus());
  assert.equal(context.api.editing,true);assert.equal(context.api.value,"Draft");
}));

test("Editable autoresize defers observer writes, coalesces and cancels on disable", async () => mounted(async context => {
  const priorObserver = globalThis.ResizeObserver;
  const observers = [];
  const frames = new Map();
  let nextFrame = 0;
  context.dom.window.requestAnimationFrame = callback => {
    const id = ++nextFrame; frames.set(id, callback); return id;
  };
  context.dom.window.cancelAnimationFrame = id => frames.delete(id);
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.element = element; }
    disconnect() { this.disconnected = true; }
  };
  try {
    await context.render({ defaultEdit: true, autoResize: true, defaultValue: "Wrapping text" }, true);
    const element = context.dom.window.document.querySelector("textarea");
    let width = 150, height = 52;
    Object.defineProperties(element, {
      clientWidth: { configurable: true, get: () => width },
      scrollHeight: { configurable: true, get: () => height },
      clientHeight: { configurable: true, get: () => 32 },
      offsetHeight: { configurable: true, get: () => 34 },
    });
    const observer = observers.find(entry => entry.element === element);
    const before = element.style.height;
    observer.callback([]);
    width = 100; height = 72;
    observer.callback([]);
    assert.equal(element.style.height, before, "observer must not mutate observed height");
    assert.equal(frames.size, 1);
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(0));
    assert.equal(element.style.height, "74px", "latest intrinsic size is applied");
    observer.callback([]);
    assert.equal(frames.size, 0, "height-only notification schedules no resize");
    width = 90; observer.callback([]);
    assert.equal(frames.size, 1);
    await context.render({ defaultEdit: true, autoResize: false }, true);
    assert.equal(frames.size, 0);
    assert.equal(observer.disconnected, true);
    width = 80; observer.callback([]);
    assert.equal(frames.size, 0, "stale delivery is inert after cleanup");
  } finally {
    if (priorObserver === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = priorObserver;
  }
}));
