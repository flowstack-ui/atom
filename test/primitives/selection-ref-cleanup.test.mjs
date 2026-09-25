import {test,assert,React} from "../test-utils.mjs";
import {JSDOM} from "jsdom";
import {createRoot} from "react-dom/client";
import {ActionDelegate} from "../../dist/action-delegate.js";
test("composed callback cleanup also clears object refs",{skip:!React.version.startsWith("19")},()=>{
  const dom=new JSDOM("<div id='app'></div>");
  const previous={window:globalThis.window,document:globalThis.document};
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const root=createRoot(document.getElementById("app"));
  const object=React.createRef();
  let cleaned=0;
  try {
    React.act(()=>root.render(React.createElement(ActionDelegate,{targetId:"go",ref:object},React.createElement("article",{ref:()=>()=>{cleaned++;}},React.createElement("button",{id:"go"},"Open")))));
    assert.ok(object.current);
    React.act(()=>root.unmount());
    assert.equal(cleaned,1);
    assert.equal(object.current,null);
  } finally {
    dom.window.close();globalThis.window=previous.window;globalThis.document=previous.document;delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
