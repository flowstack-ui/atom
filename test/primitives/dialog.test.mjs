import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

import {
  Dialog,
  AlertDialog,
  ActionBar,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  ModalRoot,
} from "../../dist/index.js";

test("Dialog keepMounted preserves the content node and child state across close", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true, url: "https://example.test" });
  const saved = new Map();
  const globals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node,
    MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true };
  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const root = createRoot(document.getElementById("root"));
  function Counter() { const [count, setCount] = React.useState(0); return React.createElement("button", { onClick: () => setCount(count + 1) }, String(count)); }
  const render = open => React.createElement(Dialog.Root, { open, keepMounted: true },
    React.createElement(Dialog.Positioner, null,
      React.createElement(Dialog.Content, { "aria-label": "Retained", initialFocus: false, finalFocus: false }, React.createElement(Counter))));
  try {
    await React.act(async () => root.render(render(true)));
    const content = document.querySelector('[role="dialog"]');
    await React.act(async () => content.querySelector("button").click());
    assert.equal(content.textContent, "1");
    await React.act(async () => root.render(render(false)));
    await React.act(async () => new Promise(resolve => setTimeout(resolve, 100)));
    assert.equal(document.querySelector('[role="dialog"]'), content);
    assert.equal(content.hidden, true);
    await React.act(async () => root.render(render(true)));
    assert.equal(document.querySelector('[role="dialog"]'), content);
    assert.equal(content.textContent, "1");
    assert.equal(content.hidden, false);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
});

test("Dialog renders its own trigger, content, title, description, close, overlay, and portal parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(DialogTrigger, null, "Open"),
      React.createElement(DialogTitle, null, "Settings"),
      React.createElement(DialogDescription, null, "Change preferences"),
      React.createElement(
        DialogContent,
        { ariaLabel: "Settings dialog", className: "content-class" },
        "Body",
        React.createElement(DialogClose, null, "Close"),
      ),
    ),
  );

  assert.equal(Dialog.Trigger, DialogTrigger);
  assert.equal(Dialog.Portal, DialogPortal);
  assert.equal(Dialog.Overlay, DialogOverlay);
  assert.equal(Dialog.Content, DialogContent);
  assert.equal(Dialog.Title, DialogTitle);
  assert.equal(Dialog.Description, DialogDescription);
  assert.equal(Dialog.Close, DialogClose);
  assert.match(html, /data-slot="dialog-trigger"/);
  assert.match(html, /data-slot="dialog-title"/);
  assert.match(html, /data-slot="dialog-description"/);
  assert.match(html, /data-slot="dialog-content"/);
  assert.match(html, /data-slot="dialog-close"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-label="Settings dialog"/);
  assert.doesNotMatch(html, /aria-labelledby=/);
  assert.match(html, /class="content-class"/);
  assert.doesNotMatch(html, /data-slot="modal-trigger"/);
  assert.doesNotMatch(html, /data-slot="modal-title"/);
  assert.doesNotMatch(html, /data-slot="modal-description"/);
  assert.doesNotMatch(html, /data-slot="modal-close"/);
});

for (const [name, Modal] of [["Dialog", Dialog], ["AlertDialog", AlertDialog]]) {
  test(`${name} positioner shares the modal layer above a mounted ActionBar`, async () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true, url: "https://example.test" });
    const saved = new Map();
    const globals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node,
      MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
      requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
      IS_REACT_ACT_ENVIRONMENT: true };
    for (const [key, value] of Object.entries(globals)) {
      saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const root = createRoot(document.getElementById("root"));

    const positionerRef = React.createRef();
    const render = open => React.createElement(React.Fragment, null,
      React.createElement(ActionBar.Root, { open: true },
        React.createElement(ActionBar.Positioner, null,
          React.createElement(ActionBar.Content, { "aria-label": "Selection actions" }, "Selected"))),
      React.createElement(Modal.Root, { open, keepMounted: true },
        React.createElement(Modal.Portal, null,
          React.createElement(Modal.Overlay),
          React.createElement(Dialog.Positioner, { ref: positionerRef, style: { padding: 12 } },
            React.createElement(Modal.Content, { "aria-label": "Confirm", initialFocus: false, finalFocus: false },
              React.createElement(Modal.Description, null, "Continue editing or discard changes."),
              React.createElement("button", null, "Keep editing"))))));
    try {
      await React.act(async () => root.render(render(false)));
      for (let cycle = 0; cycle < 2; cycle++) {
        await React.act(async () => root.render(render(true)));
        await React.act(async () => new Promise(resolve => setTimeout(resolve, 80)));
        const overlay = document.querySelector('[data-slot$="dialog-overlay"]');
        const content = positionerRef.current.querySelector('[role="dialog"], [role="alertdialog"]');
        const offset = overlay.style.getPropertyValue("--atom-overlay-layer");
        assert.ok(Number(offset) > 0, "modal must have a nonzero layer above ActionBar");
        assert.equal(positionerRef.current.style.getPropertyValue("--atom-overlay-layer"), offset);
        assert.equal(content.style.getPropertyValue("--atom-overlay-layer"), offset);
        assert.equal(positionerRef.current.style.padding, "12px");
        assert.ok(document.querySelector('[data-slot="action-bar-content"]'));
        await React.act(async () => root.render(render(false)));
      }
      const positioner = positionerRef.current;
      await React.act(async () => root.unmount());
      assert.equal(positioner.style.getPropertyValue("--atom-overlay-layer"), "");
    } finally {
      if (positionerRef.current) await React.act(async () => root.unmount());
      dom.window.close();
      for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
    }
  });
}
