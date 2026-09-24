import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { createOverlay } from "../../dist/overlay-manager.js";
import { Dialog } from "../../dist/dialog.js";

test("OverlayManager settles a Dialog closed before its first open commit", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true });
  const previous = {window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
  const manager=createOverlay(({title,...props})=>React.createElement(Dialog.Root,props,
    React.createElement(Dialog.Content,{"aria-label":title},"Content")));
  const root=createRoot(document.getElementById("root"));
  try {
    await React.act(async()=>root.render(React.createElement(React.StrictMode,null,React.createElement(manager.Viewport))));
    let result, exit, exited=false;
    await React.act(async()=>{result=manager.open("quick",{title:"Quick"});exit=manager.close("quick","done");exit.then(()=>exited=true);});
    assert.equal(await result,"done");
    assert.equal(exited,true,"No visual exit exists before an open commit");
    assert.equal(manager.has("quick"),false);
    assert.equal(document.querySelectorAll('[role="dialog"]').length,0);
  } finally {await React.act(async()=>root.unmount());Object.assign(globalThis,previous);dom.window.close();}
});

test("OverlayManager handles suspended, replaced and layout-effect closures", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true });
  const previous = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  const pending = new Promise(() => {});
  let current;
  function Panel(props) {
    current = props;
    React.useLayoutEffect(() => { if (props.closeOnMount) props.onOpenChange(false); }, []);
    if (props.suspend) throw pending;
    return React.createElement("div", null, "Panel");
  }
  const manager = createOverlay(Panel);
  const root = createRoot(document.getElementById("root"));
  try {
    await React.act(async () => root.render(React.createElement(React.Suspense, { fallback: "Loading" }, React.createElement(manager.Viewport))));
    await React.act(async () => { void manager.open("suspended", { suspend: true }); });
    let exited = false;
    await React.act(async () => { manager.close("suspended").then(() => { exited = true; }); });
    assert.equal(exited, true);
    assert.equal(manager.has("suspended"), false);
    await React.act(async () => {
      void manager.open("replacement", {});
      void manager.close("replacement");
      void manager.open("replacement", {});
    });
    assert.equal(manager.get("replacement").open, true, "Queued cleanup cannot remove a newer generation");
    await React.act(async () => manager.removeAll());
    await React.act(async () => { void manager.open("layout", { closeOnMount: true }); });
    assert.equal(manager.has("layout"), true, "A real open commit must still await the owner's exit");
    assert.equal(manager.get("layout").open, false);
    await React.act(async () => current.onExitComplete());
    assert.equal(manager.has("layout"), false);
  } finally {
    await React.act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("OverlayManager isolates result, exit and generation lifetime", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true });
  const previous = {window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
  let current;
  function Panel(props) { current=props; return React.createElement("div",null,props.title); }
  const manager=createOverlay(Panel);
  const root=createRoot(document.getElementById('root'));
  try {
    await assert.rejects(manager.open('x',{title:'Before host'}), /Viewport/);
    await React.act(async()=>root.render(React.createElement(React.StrictMode,null,React.createElement(manager.Viewport))));
    await assert.rejects(manager.open(' ',{title:'Empty ID'}),/nonempty/);
    assert.throws(()=>manager.open('reserved',{title:'Invalid',open:true}),/lifecycle-owned/);
    assert.throws(()=>manager.get('absent'),/does not exist/);
    assert.throws(()=>manager.update('absent',{title:'Invalid'}),/does not exist/);
    await manager.close('absent');await manager.waitForExit('absent');manager.remove('absent');
    let result;
    await React.act(async()=>{ result=manager.open('x',{title:'First'}); });
    const snapshot=manager.getSnapshot(); assert.equal(snapshot,manager.getSnapshot());
    await React.act(async()=>{ assert.equal(manager.open('x',{title:'Updated'}),result); });
    assert.equal(current.title,'Updated');
    await React.act(async()=>manager.update('x',{title:'Live props'}));assert.equal(current.title,'Live props');
    assert.throws(()=>manager.update('x',{onExitComplete(){}}),/lifecycle-owned/);
    let exit; let exited=false;
    await React.act(async()=>{ exit=manager.close('x',42); exit.then(()=>{exited=true;}); });
    assert.equal(await result,42); assert.equal(exited,false);
    const oldComplete=current.onExitComplete;
    const oldDisclosure=current.onOpenChange;
    assert.equal(manager.close('x',99),exit);assert.equal(await result,42);
    let second;
    await React.act(async()=>{ second=manager.open('x',{title:'Reopened'}); });
    await exit; assert.equal(exited,true);
    await React.act(async()=>oldComplete()); assert.equal(manager.has('x'),true);
    await React.act(async()=>oldDisclosure(false));assert.equal(manager.get('x').open,true);
    await React.act(async()=>manager.removeAll()); assert.equal(await second,undefined);
    let disposed;
    await React.act(async()=>{ disposed=manager.open('dispose',{title:'Pending'}); });
    await React.act(async()=>root.unmount()); assert.equal(await disposed,undefined);
  } finally { Object.assign(globalThis,previous); dom.window.close(); }
});

test("OverlayManager has an empty deterministic server viewport",()=>{
  const manager=createOverlay(()=>React.createElement("div",null,"Not opened"));
  assert.equal(renderToStaticMarkup(React.createElement(manager.Viewport)),"");
  assert.deepEqual(manager.getSnapshot(),[]);
});

test("OverlayManager diagnoses duplicate hosts without leaving a pending result",async()=>{
  const dom=new JSDOM('<div id="root"></div>',{pretendToBeVisual:true});
  const previous={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
  const manager=createOverlay(()=>null);let error;
  class Boundary extends React.Component {
    state={failed:false};
    static getDerivedStateFromError(){return {failed:true};}
    componentDidCatch(value){error=value;}
    render(){return this.state.failed?null:this.props.children;}
  }
  const root=createRoot(document.getElementById('root'),{onCaughtError(){}});
  try{
    await React.act(async()=>root.render(React.createElement(Boundary,null,React.createElement(manager.Viewport,{key:'first'}))));
    let result;await React.act(async()=>{result=manager.open('pending',{});});
    await React.act(async()=>root.render(React.createElement(Boundary,null,React.createElement(manager.Viewport,{key:'first'}),React.createElement(manager.Viewport,{key:'second'}))));
    assert.match(error.message,/exactly one/);assert.equal(await result,undefined);assert.equal(manager.has('pending'),false);
  }finally{await React.act(async()=>root.unmount());Object.assign(globalThis,previous);dom.window.close();}
});
