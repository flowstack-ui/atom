import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { assert, test, React } from "./test-utils.mjs";
import { useDismissableLayer } from "../dist/_internal/hooks/useDismissableLayer.js";
import { useCreateOverlayScope, OverlayScopeProvider, useOverlayLayerHost } from "../dist/_internal/hooks/overlayScope.js";

test("overlay ordering follows portal ancestry, modal barriers and owner documents",async()=>{
  const dom=new JSDOM("<div id='root'></div>",{pretendToBeVisual:true});
  const other=new JSDOM("<div id='root'></div>",{pretendToBeVisual:true});
  const keys=["window","document","HTMLElement","IS_REACT_ACT_ENVIRONMENT"];
  const previous=Object.fromEntries(keys.map(key=>[key,globalThis[key]]));
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
  const root=createRoot(document.getElementById("root")),second=createRoot(other.window.document.getElementById("root"));
  const calls=[],activate={};
  function Host(){const ref=useOverlayLayerHost();return React.createElement("div",{ref,"data-extra-host":""});}
  function Layer({name,modal=false,doc=document,children}){
    const scope=useCreateOverlayScope(modal),ref=React.useRef(null);
    const promote=useDismissableLayer({enabled:true,ownerDocument:doc,scope,getElements:()=>[ref.current],onEscapeKeyDown:()=>calls.push(name)});
    activate[name]=promote;
    return React.createElement(OverlayScopeProvider,{value:scope},React.createElement("div",{ref,"data-layer":name}),children);
  }
  try{
    await React.act(async()=>root.render(React.createElement(React.Fragment,null,
      React.createElement(Layer,{name:"modal",modal:true},React.createElement(Host),createPortal(React.createElement(Layer,{name:"nested"}),document.body)),
      React.createElement(Layer,{name:"background"}))));
    const index=name=>Number(document.querySelector(`[data-layer="${name}"]`).style.getPropertyValue("--atom-overlay-layer"));
    assert.ok(index("nested")>index("modal"));assert.ok(index("modal")>index("background"));
    assert.equal(Number(document.querySelector('[data-extra-host]').style.getPropertyValue('--atom-overlay-layer')),index("modal"));
    await React.act(async()=>activate.background());
    document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape"}));assert.equal(calls.at(-1),"nested");
    await React.act(async()=>second.render(React.createElement(Layer,{name:"other-document",doc:other.window.document})));
    other.window.document.dispatchEvent(new other.window.KeyboardEvent("keydown",{key:"Escape"}));assert.equal(calls.at(-1),"other-document");
    document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape"}));assert.equal(calls.at(-1),"nested");
    await React.act(async()=>root.unmount());
    const count=calls.length;document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape"}));assert.equal(calls.length,count);
  }finally{await React.act(async()=>second.unmount());for(const key of keys)previous[key]===undefined?delete globalThis[key]:globalThis[key]=previous[key];dom.window.close();other.window.close();}
});
