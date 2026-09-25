import { JSDOM } from "jsdom";
import { assert, test, React } from "../test-utils.mjs";
import { NumberInput } from "../../dist/number-input.js";

async function mounted(run) {
  const dom = new JSDOM("<div id='app'></div>", { pretendToBeVisual: true, url: "http://localhost" });
  const names = ["window", "document", "navigator", "HTMLElement", "Element", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[name] });
  const captures = new WeakMap();
  dom.window.HTMLElement.prototype.setPointerCapture = function(id) { captures.set(this,id); };
  dom.window.HTMLElement.prototype.hasPointerCapture = function(id) { return captures.get(this) === id; };
  dom.window.HTMLElement.prototype.releasePointerCapture = function() { captures.delete(this); };
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("app"));
  const render = (props = {}, shown = true) => React.act(async () => root.render(
    React.createElement(NumberInput.Root, { defaultValue: 0, ...props },
      React.createElement(NumberInput.Input, { "aria-label": "Amount" }),
      shown && React.createElement(NumberInput.Scrubber, { onPointerUp: e => e.preventDefault(), onPointerCancel: e => e.preventDefault() }, "Drag"))));
  const pointer = async (target,type,values={}) => React.act(async () => {
    const event = new dom.window.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, buttons: 1, clientX: 10, ...values });
    Object.defineProperty(event, "pointerId", { value: values.pointerId ?? 1 });
    target.dispatchEvent(event);
  });
  try { await render(); await run({ dom, render, pointer, scrub: () => document.querySelector('[data-slot="number-input-scrubber"]') }); }
  finally { await React.act(async () => root.unmount()); for (const name of names) { if(previous[name]) Object.defineProperty(globalThis,name,previous[name]); else delete globalThis[name]; } dom.window.close(); }
}

test("scrubber exposes active state, ignores foreign pointers and ends despite cancelled user handlers", () => mounted(async ({pointer,scrub}) => {
  const el=scrub();
  await pointer(el,"pointerdown"); assert.ok(el.hasAttribute("data-scrubbing"));
  await pointer(el,"pointermove",{clientX:26}); assert.equal(document.querySelector('input').value,"2");
  await pointer(el,"pointerup",{pointerId:2}); assert.ok(el.hasAttribute("data-scrubbing"));
  await pointer(el,"pointerup"); assert.equal(el.hasAttribute("data-scrubbing"),false); assert.equal(el.hasPointerCapture(1),false);
  await pointer(el,"pointermove",{clientX:50}); assert.equal(document.querySelector('input').value,"2");
}));

test("scrubber cleans cancellation, capture loss, window blur, Escape and missing button state", () => mounted(async ({pointer,scrub}) => {
  const el=scrub();
  for (const end of [
    () => pointer(el,"pointercancel"),
    () => pointer(el,"lostpointercapture"),
    () => React.act(async () => window.dispatchEvent(new window.Event("blur"))),
    () => React.act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Escape",bubbles:true}))),
    () => pointer(el,"pointermove",{buttons:0}),
  ]) {
    await pointer(el,"pointerdown"); assert.ok(el.hasAttribute("data-scrubbing"));
    await end(); assert.equal(el.hasAttribute("data-scrubbing"),false); assert.equal(el.hasPointerCapture(1),false);
  }
}));

test("scrubber stops when disabled, readonly, hidden or unmounted", () => mounted(async ({pointer,scrub,render}) => {
  for(const prop of ['disabled','readOnly']) {
    await render(); const el=scrub(); await pointer(el,'pointerdown');
    await render({[prop]:true}); assert.equal(el.hasAttribute('data-scrubbing'),false);
    await pointer(el,'pointerdown'); assert.equal(el.hasAttribute('data-scrubbing'),false);
  }
  await render(); const el=scrub(); await pointer(el,'pointerdown');
  await React.act(async () => { Object.defineProperty(document,'hidden',{configurable:true,value:true}); document.dispatchEvent(new window.Event('visibilitychange')); });
  assert.equal(el.hasAttribute('data-scrubbing'),false);
  Object.defineProperty(document,'hidden',{configurable:true,value:false});
  await pointer(el,'pointerdown'); await render({},false);
  assert.equal(document.querySelector('[data-scrubbing]'),null); assert.equal(el.hasPointerCapture(1),false);
}));
