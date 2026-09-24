import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

import {
  Drawer,
  DrawerContext,
  DrawerPositioner,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  ModalRoot,
} from "../../dist/index.js";

test("Drawer exposes Positioner and Context with nonmodal semantics", () => {
  assert.equal(Drawer.Context, DrawerContext);
  assert.equal(Drawer.Positioner, DrawerPositioner);
  const html = renderToStaticMarkup(React.createElement(Drawer.Root, { defaultOpen: true, modal: false },
    React.createElement(Drawer.Positioner, null,
      React.createElement(Drawer.Content, { "aria-label": "Inspector" },
        React.createElement(Drawer.Context, null, ({ open }) => String(open))))));
  assert.match(html, /drawer-positioner/);
  assert.match(html, /true/);
  assert.doesNotMatch(html, /aria-modal/);
});

test("retained Drawer keeps hidden on its own host, not a replacement wrapper", () => {
  const html = renderToStaticMarkup(React.createElement(Drawer.Root, { keepMounted: true },
    React.createElement(Drawer.Content, { "aria-label": "Retained" }, "State")));
  assert.equal((html.match(/<div/g) || []).length, 1);
  assert.match(html, /hidden=""/);
});

test("Drawer renders its own trigger, content, title, description, close, overlay, and portal parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(DrawerTrigger, null, "Open"),
      React.createElement(DrawerTitle, null, "Navigation"),
      React.createElement(DrawerDescription, null, "Primary app navigation"),
      React.createElement(
        DrawerContent,
        { placement: "left", ariaLabel: "Navigation drawer" },
        "Panel",
        React.createElement(DrawerClose, null, "Close"),
      ),
    ),
  );

  assert.equal(Drawer.Trigger, DrawerTrigger);
  assert.equal(Drawer.Portal, DrawerPortal);
  assert.equal(Drawer.Overlay, DrawerOverlay);
  assert.equal(Drawer.Content, DrawerContent);
  assert.equal(Drawer.Title, DrawerTitle);
  assert.equal(Drawer.Description, DrawerDescription);
  assert.equal(Drawer.Close, DrawerClose);
  assert.match(html, /data-slot="drawer-trigger"/);
  assert.match(html, /data-slot="drawer-title"/);
  assert.match(html, /data-slot="drawer-description"/);
  assert.match(html, /data-slot="drawer-content"/);
  assert.match(html, /data-slot="drawer-close"/);
  assert.match(html, /data-placement="left"/);
  assert.match(html, /aria-label="Navigation drawer"/);
  assert.doesNotMatch(html, /data-slot="modal-trigger"/);
  assert.doesNotMatch(html, /data-slot="modal-title"/);
  assert.doesNotMatch(html, /data-slot="modal-description"/);
  assert.doesNotMatch(html, /data-slot="modal-close"/);
});

test("DrawerContent keeps className when hidden with keepMounted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { keepMounted: true },
      React.createElement(
        DrawerContent,
        { className: "hidden-drawer", placement: "right" },
        "Panel",
      ),
    ),
  );

  assert.match(html, /hidden=""/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /data-slot="drawer-content"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /data-placement="right"/);
  assert.match(html, /class="hidden-drawer"/);
});

test("Drawer keepMounted preserves the content node and child state across close", async () => {
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
  const render = open => React.createElement(Drawer.Root, { open, keepMounted: true },
    React.createElement(Drawer.Positioner, null,
      React.createElement(Drawer.Content, { "aria-label": "Retained", initialFocus: false, finalFocus: false }, React.createElement(Counter))));
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
    let cancel = true;
    const changes = [];
    const policies = () => React.createElement(Drawer.Root, {
      open: true, modal: false,
      onOpenChange: (open, reason) => changes.push([open, reason]),
      onInteractOutside: event => { if (cancel) event.preventDefault(); },
      onEscapeKeyDown: event => { if (cancel) event.preventDefault(); },
    }, React.createElement(Drawer.Content, { "aria-label": "Inspector", initialFocus: false, finalFocus: false }, "Content"));
    await React.act(async () => root.render(policies()));
    const outside = document.createElement("button");
    document.body.append(outside);
    await React.act(async () => outside.click());
    await React.act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    assert.deepEqual(changes, [], "both native dismissal events are cancelable");
    cancel = false;
    await React.act(async () => outside.click());
    assert.deepEqual(changes, [[false, "backdropClick"]]);
    outside.remove();
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
});
