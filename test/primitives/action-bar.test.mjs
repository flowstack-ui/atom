import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { ActionBar, useActionBar } from "../../dist/action-bar.js";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
const h = React.createElement;
test("ActionBar is closed and lazy by default", () => {
  assert.equal(renderToStaticMarkup(h(ActionBar.Root, null, h(ActionBar.Content, {"aria-label":"Files"}, "Actions"))), "");
});
test("ActionBar Positioner is an unstyled native stacking host",()=>{
  const html=renderToStaticMarkup(h(ActionBar.Root,null,h(ActionBar.Positioner,{"data-testid":"host"},"Placement")));
  assert.match(html,/data-slot="action-bar-positioner"/);assert.match(html,/data-testid="host"/);assert.doesNotMatch(html,/style=/);
});
test("ActionBar open content is named, detached and has no dead tab guards", () => {
  const html = renderToStaticMarkup(h(ActionBar.Root, {defaultOpen:true}, h(ActionBar.Content, {"aria-label":"Files"}, h(ActionBar.CloseTrigger, null,"Close"))));
  assert.match(html,/role="dialog"/); assert.match(html,/aria-label="Files"/);
  assert.match(html,/type="button"/); assert.doesNotMatch(html,/popover-viewport|focus-guard|position:|transform:/);
  assert.doesNotMatch(html,/aria-modal="true"/);
});
test("ActionBar retains initially hidden children only when requested", () => {
  const html = renderToStaticMarkup(h(ActionBar.Root, {lazyMount:false,unmountOnExit:false}, h(ActionBar.Content, {"aria-label":"Files"}, "Retained")));
  assert.match(html,/hidden=""/); assert.match(html,/Retained/);
});
test("ActionBar Context reports controlled state without selection machinery", () => {
  const html = renderToStaticMarkup(h(ActionBar.RootProvider, {open:true}, h(ActionBar.Context, null, value => String(value.open))));
  assert.equal(html,"true");
});

async function withDom(run) {
  const dom = new JSDOM("<div id='test'></div><button id='outside'>Outside</button>", { url: "https://example.test", pretendToBeVisual: true });
  const saved = new Map();
  for (const key of ["window", "document", "Node", "Element", "HTMLElement", "HTMLButtonElement", "MutationObserver", "Event", "FocusEvent", "KeyboardEvent", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(dom.window.document.getElementById("test"));
  try { await run(root, dom.window); }
  finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, value] of saved) { if (value) Object.defineProperty(globalThis, key, value); else delete globalThis[key]; }
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
}

test("ActionBar controller provider and legacy provider both preserve state", async () => {
  await withDom(async (root, win) => {
    let api;
    function Demo() { api = useActionBar(); return h(ActionBar.RootProvider, { value: api }, h(ActionBar.Content, { "aria-label": "Actions" }, "Actions")); }
    await React.act(async () => root.render(h(Demo)));
    assert.deepEqual(Object.keys(api).sort(), ["open", "setOpen"]);
    await React.act(async () => api.setOpen(true));
    assert.equal(win.document.querySelector('[role="dialog"]').hidden, false);
    await React.act(async () => api.setOpen(false));
    await React.act(async () => new Promise(resolve => win.requestAnimationFrame(resolve)));
    assert.equal(win.document.querySelector('[role="dialog"]'), null);
    await React.act(async () => root.render(h(ActionBar.RootProvider, { defaultOpen: true }, h(ActionBar.Content, { "aria-label": "Legacy" }, "Legacy"))));
    assert.equal(win.document.querySelector('[role="dialog"]').getAttribute("aria-label"), "Legacy");
  });
});

test("ActionBar deferred controller content restores its external opener", async () => {
  await withDom(async (root, win) => {
    let api;
    function Demo() { api = useActionBar({ immediate: false }); return h(ActionBar.RootProvider, { value: api }, h(ActionBar.Content, { "aria-label": "Actions" }, h(ActionBar.CloseTrigger, null, "Close"))); }
    await React.act(async () => root.render(h(Demo)));
    const opener = win.document.getElementById("outside");
    opener.focus();
    await React.act(async () => api.setOpen(true));
    await React.act(async () => new Promise(resolve => win.requestAnimationFrame(resolve)));
    const close = win.document.querySelector('[role="dialog"] button');
    await React.act(async () => close.focus());
    await React.act(async () => close.click());
    await React.act(async () => new Promise(resolve => win.requestAnimationFrame(resolve)));
    assert.equal(win.document.activeElement, opener);
  });
});

test("ActionBar root focus callbacks run once and can prevent dismissal", async () => {
  await withDom(async (root, win) => {
    const calls = [];
    await React.act(async () => root.render(h(ActionBar.Root, { defaultOpen: true,
      onFocusOutside: event => { calls.push("focus"); event.preventDefault(); },
      onInteractOutside: event => { calls.push("interact"); assert.equal(event.defaultPrevented, true); },
      onOpenChange: () => calls.push("closed"),
    }, h(ActionBar.Content, { "aria-label": "Actions" }, h("button", null, "Inside")))));
    await React.act(async () => win.document.querySelector('#outside').focus());
    assert.deepEqual(calls, ["focus", "interact"]);
    assert.equal(win.document.querySelector('[role="dialog"]').hidden, false);
  });
});

test("ActionBar controller Escape callback is not duplicated", async () => {
  await withDom(async (root, win) => {
    let count = 0;
    function Demo() { const value = useActionBar({ defaultOpen: true, onEscapeKeyDown: event => { count++; event.preventDefault(); } }); return h(ActionBar.RootProvider, { value }, h(ActionBar.Content, { "aria-label": "Actions" }, "Actions")); }
    await React.act(async () => root.render(h(Demo)));
    await React.act(async () => win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    assert.equal(count, 1);
    assert.ok(win.document.querySelector('[role="dialog"]'));
  });
});

test("ActionBar Positioner composes its actual host and forwards refs", async () => {
  await withDom(async (root, win) => {
    const ref = React.createRef();
    await React.act(async () => root.render(h(ActionBar.Root, null, h(ActionBar.Positioner, { asChild: true, ref }, h("section", { id: "host" }, "Host")))));
    assert.equal(ref.current, win.document.getElementById("host"));
    assert.equal(win.document.querySelectorAll('#host').length, 1);
    assert.equal(ref.current.dataset.slot, "action-bar-positioner");
    await React.act(async () => root.render(null));
    assert.equal(ref.current, null);
  });
});

test("ActionBar immediate=false defers detached opening to a frame", async () => {
  await withDom(async (root, win) => {
    let api;
    const frames = new Map(); let id = 0;
    win.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
    win.cancelAnimationFrame = key => frames.delete(key);
    function Demo() { api = useActionBar({ immediate: false }); return h(ActionBar.RootProvider, { value: api }, h(ActionBar.Content, { "aria-label": "Actions" }, "Actions")); }
    await React.act(async () => root.render(h(Demo)));
    await React.act(async () => api.setOpen(true));
    assert.equal(win.document.querySelector('[role="dialog"]'), null);
    await React.act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(16)); });
    assert.ok(win.document.querySelector('[role="dialog"]'));
  });
});

test("ActionBar outside focus closes unless a persistent region contains it", async () => {
  await withDom(async (root, win) => {
    const outside = win.document.getElementById("outside");
    const changes = [];
    const tree = persistent => h(ActionBar.Root, { defaultOpen: true, persistentElements: persistent ? [() => outside] : [], onOpenChange: value => changes.push(value) }, h(ActionBar.Content, { "aria-label": "Actions" }, h("button", null, "Inside")));
    await React.act(async () => root.render(tree(true)));
    await React.act(async () => outside.focus());
    assert.deepEqual(changes, []);
    await React.act(async () => win.document.querySelector('[role="dialog"] button').focus());
    await React.act(async () => root.render(tree(false)));
    await React.act(async () => outside.focus());
    assert.deepEqual(changes, [false]);
    assert.equal(win.document.activeElement, outside);
  });
});

test("ActionBar retained content is inert and preserves host through reopen", async () => {
  await withDom(async (root, win) => {
    const tree = open => h(ActionBar.Root, { open, unmountOnExit: false }, h(ActionBar.Content, { "aria-label": "Actions" }, "Draft"));
    await React.act(async () => root.render(tree(true)));
    const host = win.document.querySelector('[role="dialog"]');
    await React.act(async () => root.render(tree(false)));
    assert.equal(host.hasAttribute("inert"), true);
    await React.act(async () => new Promise(resolve => win.requestAnimationFrame(resolve)));
    assert.equal(host.hidden, true);
    await React.act(async () => root.render(tree(true)));
    assert.equal(win.document.querySelector('[role="dialog"]'), host);
    assert.equal(host.hidden, false);
    assert.equal(host.hasAttribute("inert"), false);
  });
});

test("ActionBar controlled presence can suppress an open layer", () => {
  const markup = renderToStaticMarkup(h(ActionBar.Root, { open: true, present: false }, h(ActionBar.Content, { "aria-label": "Actions" }, "Actions")));
  assert.equal(markup, "");
});

test("ActionBar outside focus uses the portal document's event realm", async () => {
  await withDom(async (root, win) => {
    const frame = win.document.createElement("iframe");
    win.document.body.append(frame);
    const child = frame.contentWindow;
    const outside = child.document.createElement("button");
    child.document.body.append(outside);
    let calls = 0;
    await React.act(async () => root.render(h(ActionBar.Root, { defaultOpen: true, onFocusOutside: event => {
      calls++; assert.ok(event instanceof child.FocusEvent); event.preventDefault();
    } }, h(ActionBar.Portal, { container: child.document.body }, h(ActionBar.Content, { "aria-label": "Frame actions" }, "Actions")))));
    await React.act(async () => outside.focus());
    assert.equal(calls, 1);
    assert.ok(child.document.querySelector('[role="dialog"]'));
  });
});
