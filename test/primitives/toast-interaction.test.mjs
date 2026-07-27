import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Toast, getToasts, toast } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><button id='before'>Before</button><div id='root'></div></body></html>", {
    pretendToBeVisual: true,
    url: "https://example.test/",
  });
  const saved = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    MouseEvent: dom.window.MouseEvent,
    FocusEvent: dom.window.FocusEvent,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLElement.prototype.setPointerCapture = () => {};
  return {
    container: dom.window.document.getElementById("root"),
    dom,
    cleanup() {
      toast.dismiss();
      dom.window.close();
      for (const [key, descriptor] of saved) {
        descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
      }
    },
  };
}

async function wait(milliseconds) {
  await React.act(async () => new Promise((resolve) => setTimeout(resolve, milliseconds)));
}

function dispatchPointer(target, type, values) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: values.clientX, clientY: values.clientY, button: 0 });
  Object.defineProperty(event, "pointerId", { value: 1 });
  target.dispatchEvent(event);
}

test("Toast hotkey access pauses focus, Escape dismisses, and focus restores", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(React.createElement(
        Toast.Provider,
        { closeButton: true, pauseOnFocus: true },
        React.createElement(Toast.Viewport, { portalDisabled: true, position: "bottom-start" }),
      ));
      toast.success("Saved", { id: "focus-toast", duration: 5000 });
    });
    const before = document.getElementById("before");
    const viewport = document.querySelector('[data-slot="toast-viewport"]');
    const card = document.querySelector('[data-slot="toast"]');
    before.focus();
    await React.act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "F8", key: "F8" })));
    assert.equal(document.activeElement, viewport);
    assert.equal(getToasts()[0].paused, true);
    card.focus();
    await React.act(async () => card.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })));
    await wait(230);
    assert.equal(getToasts().length, 0);
    assert.equal(document.activeElement, before);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Toast directional swipe exposes geometry and dismisses past its threshold", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(React.createElement(
        Toast.Provider,
        { swipeDirection: "right", swipeThreshold: 40 },
        React.createElement(Toast.Viewport, { portalDisabled: true }),
      ));
      toast.info("Swipe me", { id: "swipe-toast", duration: Infinity });
    });
    const card = document.querySelector('[data-slot="toast"]');
    await React.act(async () => {
      dispatchPointer(card, "pointerdown", { clientX: 10, clientY: 10 });
      dispatchPointer(card, "pointermove", { clientX: 70, clientY: 10 });
    });
    assert.equal(card.dataset.swipe, "move");
    assert.equal(card.style.getPropertyValue("--atom-toast-swipe-move-x"), "60px");
    await React.act(async () => dispatchPointer(card, "pointerup", { clientX: 70, clientY: 10 }));
    assert.equal(card.dataset.swipe, "end");
    await wait(230);
    assert.equal(getToasts().length, 0);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
