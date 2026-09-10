import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { FloatingPanel, useFloatingPanel } from "../../dist/floating-panel.js";

test("FloatingPanel controller, keyboard, stages and close preserve accepted geometry", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual:true });
  const names = ["window","document","HTMLElement","Element","Node","IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Element:dom.window.Element,Node:dom.window.Node,IS_REACT_ACT_ENVIRONMENT:true});
  const root = createRoot(document.getElementById("root"));
  let controller; const ends=[];
  function App({ controlled=false, present, persist=true, hideMode }) {
    controller=useFloatingPanel({defaultOpen:true,defaultPosition:{x:100,y:100},defaultSize:{width:320,height:240},
      ...(controlled?{position:{x:100,y:100},size:{width:320,height:240}}:{}),onPositionChangeEnd:p=>ends.push(p),persistRect:persist,present,hideMode,unmountOnExit:!hideMode,immediate:true,allowOverflow:false});
    return React.createElement(FloatingPanel.RootProvider,{value:controller},
      React.createElement(FloatingPanel.Trigger,null,"Open"),
      React.createElement(FloatingPanel.Positioner,null,
        React.createElement(FloatingPanel.Content,{render:React.createElement("section")},
          React.createElement(FloatingPanel.Header,null,React.createElement(FloatingPanel.DragTrigger,null,React.createElement(FloatingPanel.Title,null,"Inspector"))),
          React.createElement(FloatingPanel.Body,null,"Body"),
          React.createElement(FloatingPanel.CloseTrigger,{asChild:true},React.createElement("button",{"aria-label":"Dismiss inspector"},"Close")),
          React.createElement(FloatingPanel.ResizeTriggers))));
  }
  try {
    await React.act(async()=>root.render(React.createElement(App)));
    assert.deepEqual(controller.position,{x:100,y:100});
    assert.ok(document.querySelector('button[aria-label="Dismiss inspector"]'));
    const content=document.querySelector('[role=dialog]'); assert.equal(document.activeElement,content); assert.equal(content.tagName,"SECTION");
    await React.act(async()=>content.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
    assert.equal(controller.position.x,101); assert.deepEqual(ends.at(-1),{x:101,y:100});
    await React.act(async()=>controller.maximize()); assert.equal(controller.stage,'maximized'); assert.equal(controller.size.width,window.innerWidth);
    await React.act(async()=>controller.minimize()); assert.equal(controller.stage,'minimized'); assert.ok(document.querySelector('[data-slot=floating-panel-body]').hidden);
    await React.act(async()=>controller.restore()); assert.deepEqual(controller.size,{width:320,height:240}); assert.equal(controller.position.x,101);
    await React.act(async()=>controller.maximize());
    await React.act(async()=>controller.setOpen(false));
    assert.equal(controller.stage,'maximized');
    assert.equal(controller.size.width,window.innerWidth);
    await React.act(async()=>controller.setOpen(true));
    assert.deepEqual(controller.size,{width:320,height:240}); assert.equal(controller.position.x,101);
    await React.act(async()=>root.render(React.createElement(App,{controlled:true})));
    await React.act(async()=>document.querySelector('[role=dialog]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
    assert.deepEqual(controller.position,{x:100,y:100}); assert.deepEqual(ends.at(-1),{x:100,y:100});
    await React.act(async()=>root.render(React.createElement(App,{persist:false})));
    await React.act(async()=>controller.setPosition({x:200,y:180}));
    await React.act(async()=>root.render(React.createElement(App,{persist:false,present:false})));
    assert.equal(controller.open,true);assert.deepEqual(controller.position,{x:200,y:180});
    await React.act(async()=>root.render(React.createElement(App,{persist:false})));
    assert.deepEqual(controller.position,{x:200,y:180});
    if(React.Activity){
      await React.act(async()=>root.render(React.createElement(App,{persist:false,hideMode:"activity"})));
      await React.act(async()=>controller.setOpen(false));
      await React.act(async()=>new Promise(resolve=>setTimeout(resolve,80)));
      await React.act(async()=>controller.setOpen(true));
      await React.act(async()=>new Promise(resolve=>setTimeout(resolve,80)));
      assert.equal(document.querySelector('[role=dialog]').hidden,false);
      assert.equal(document.querySelector('[data-slot=floating-panel-positioner]').style.visibility,"");
    }
  } finally { await React.act(async()=>root.unmount()); for(const name of names) previous[name]===undefined?delete globalThis[name]:globalThis[name]=previous[name]; dom.window.close(); }
});
