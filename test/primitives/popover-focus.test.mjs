import {
  assert,
  test,
  React,
} from "../test-utils.mjs";
import ReactDOMClient from "react-dom/client";
import ReactDOMServer from "react-dom/server";
import jsdom from "jsdom";

import { Popover } from "../../dist/index.js";

const { act, useRef } = React;
const { hydrateRoot } = ReactDOMClient;
const { renderToString } = ReactDOMServer;
const { JSDOM } = jsdom;

async function withHydratedDom(element, run) {
  const markup = renderToString(element);
  const dom = new JSDOM(
    `<!doctype html><html><body><button id="outside">Outside</button><div id="root">${markup}</div></body></html>`,
    { url: "https://atom.test/" },
  );
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  dom.window.scrollTo = () => {};
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const saved = new Map();
  const globals = {
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
    MutationObserver: dom.window.MutationObserver,
    ResizeObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true,
  };

  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  let root;
  try {
    await act(async () => {
      root = hydrateRoot(dom.window.document.getElementById("root"), element);
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await run(dom);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function dispatchPointerActivation(element, pointerType) {
  const pointerDown = new element.ownerDocument.defaultView.MouseEvent(
    "pointerdown",
    { bubbles: true, button: 0 },
  );
  Object.defineProperty(pointerDown, "pointerType", { value: pointerType });
  element.dispatchEvent(pointerDown);
  element.dispatchEvent(new element.ownerDocument.defaultView.MouseEvent(
    "click",
    { bubbles: true, button: 0 },
  ));
}

function dispatchPointerDown(element, pointerType = "mouse") {
  const event = new element.ownerDocument.defaultView.MouseEvent(
    "pointerdown",
    { bubbles: true, button: 0 },
  );
  Object.defineProperty(event, "pointerType", { value: pointerType });
  element.dispatchEvent(event);
}

function FocusFixture({
  triggerMode = "click",
  openDelay = 0,
  closeDelay = 0,
  initialFocus,
  finalFocus,
  details,
  onOpenChange,
}) {
  const inputRef = useRef(null);
  return React.createElement(
    Popover.Root,
    { triggerMode, openDelay, closeDelay, onOpenChange },
    React.createElement(Popover.Trigger, null, "Open popover"),
    React.createElement(
      Popover.Content,
      {
        initialFocus: initialFocus === "input"
          ? (value) => {
              details?.push(value);
              return inputRef.current;
            }
          : initialFocus,
        finalFocus,
      },
      React.createElement(Popover.Title, null, "Project settings"),
      React.createElement(Popover.Description, null, "Compact options"),
      React.createElement("input", { ref: inputRef, "data-testid": "first-input" }),
      React.createElement(Popover.Close, null, "Done"),
    ),
  );
}

test("Popover mouse and touch opening use interaction-aware initial focus", async () => {
  for (const [pointerType, expectedSelector] of [
    ["mouse", "[data-testid=first-input]"],
    ["pen", "[data-testid=first-input]"],
    ["touch", "[data-slot=popover-content]"],
  ]) {
    const details = [];
    await withHydratedDom(
      React.createElement(FocusFixture, {
        initialFocus: pointerType === "touch" ? undefined : "input",
        details,
      }),
      async (dom) => {
        const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
        await act(async () => {
          dispatchPointerActivation(trigger, pointerType);
          await new Promise((resolve) => setTimeout(resolve, 20));
        });
        assert.equal(
          dom.window.document.activeElement,
          dom.window.document.querySelector(expectedSelector),
        );
        if (pointerType !== "touch") {
          assert.deepEqual(details[0], {
            interactionType: pointerType,
            reason: "triggerClick",
          });
        }
      },
    );
  }
});

test("Popover hover opening never steals focus", async () => {
  const details = [];
  await withHydratedDom(
    React.createElement(FocusFixture, {
      triggerMode: "hover",
      initialFocus: "input",
      details,
    }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      trigger.focus();
      await act(async () => {
        trigger.dispatchEvent(new dom.window.MouseEvent("mouseover", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));
      assert.equal(dom.window.document.activeElement, trigger);
      assert.deepEqual(details, []);
    },
  );
});

test("Popover Close restores focus while outside pointer dismissal preserves its target", async () => {
  await withHydratedDom(
    React.createElement(FocusFixture),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      const close = dom.window.document.querySelector("[data-slot=popover-close]");
      await act(async () => {
        dispatchPointerActivation(close, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);

      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      const outside = dom.window.document.getElementById("outside");
      await act(async () => {
        dispatchPointerDown(outside);
        outside.focus();
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, outside);
      assert.equal(dom.window.document.querySelector("[data-slot=popover-content]"), null);
    },
  );
});

test("Popover Escape reports its reason and restores the intentional session", async () => {
  const changes = [];
  await withHydratedDom(
    React.createElement(FocusFixture, {
      onOpenChange: (open, reason) => changes.push({ open, reason }),
    }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      await act(async () => {
        dom.window.document.dispatchEvent(new dom.window.KeyboardEvent(
          "keydown",
          { bubbles: true, key: "Escape" },
        ));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);
      assert.deepEqual(changes, [
        { open: true, reason: undefined },
        { open: false, reason: "escapeKeyDown" },
      ]);
    },
  );
});

test("Popover explicit false targets suppress automatic focus operations", async () => {
  await withHydratedDom(
    React.createElement(FocusFixture, { initialFocus: false, finalFocus: false }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      trigger.focus();
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);
      const close = dom.window.document.querySelector("[data-slot=popover-close]");
      close.focus();
      await act(async () => {
        dispatchPointerActivation(close, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.notEqual(dom.window.document.activeElement, trigger);
    },
  );
});
