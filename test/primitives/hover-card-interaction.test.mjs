import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { HoverCard, useHoverCard } from "../../dist/index.js";

function installDom({ hoverInput = true } = {}) {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"root\"></div></body></html>",
    { pretendToBeVisual: true, url: "https://example.test/" },
  );
  class PointerEvent extends dom.window.MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      Object.defineProperty(this, "pointerType", { value: init.pointerType ?? "mouse" });
    }
  }
  Object.defineProperty(dom.window, "PointerEvent", {
    configurable: true,
    writable: true,
    value: PointerEvent,
  });
  Object.defineProperty(dom.window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (media) => ({
      matches: hoverInput,
      media,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return true; },
    }),
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    PointerEvent,
    MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const saved = new Map();
  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return {
    container: dom.window.document.getElementById("root"),
    dom,
    cleanup() {
      dom.window.close();
      for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

async function wait(milliseconds = 0) {
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
}

function dispatchPointer(target, type, pointerType, options = {}) {
  target.dispatchEvent(new PointerEvent(type, {
    bubbles: true,
    pointerType,
    ...options,
  }));
}

function dispatchMouse(target, type, options = {}) {
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: type !== "mouseenter" && type !== "mouseleave",
    ...options,
  }));
}

async function actDispatch(callback) {
  await React.act(async () => callback());
}

test("HoverCard controller shares one retained host between valued triggers", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  let controller;
  function Shared() {
    controller = useHoverCard({ openDelay: 0, unmountOnExit: false, lazyMount: false });
    return React.createElement(HoverCard.RootProvider, { value: controller },
      ...["ada", "grace"].map(value => React.createElement(HoverCard.Trigger, { key: value, value, asChild: true }, React.createElement("a", { href: `/${value}` }, value))),
      React.createElement(HoverCard.Content, null, React.createElement(HoverCard.Context, null, ({ triggerValue }) => triggerValue ?? "empty")));
  }
  try {
    await React.act(async () => root.render(React.createElement(Shared)));
    const host = container.querySelector("[data-slot='hover-card-content']");
    assert.equal(host.hidden, true);
    await actDispatch(() => dispatchMouse(container.querySelector("a"), "mouseover"));
    await wait(25);
    assert.equal(controller.open, true);
    assert.equal(host.textContent, "ada");
    await actDispatch(() => dispatchMouse(container.querySelectorAll("a")[1], "mouseover"));
    await wait(25);
    assert.equal(host.textContent, "grace");
    assert.equal(container.querySelector("[data-slot='hover-card-content']"), host);
    await React.act(async () => controller.setOpen(false));
    await wait(30);
    assert.equal(host.hidden, true);
    assert.equal(host.getAttribute("aria-hidden"), "true");
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

test("HoverCard cancels pending keyboard opening when disabled", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const render = disabled => React.createElement(HoverCard.Root, { disabled, openDelay: 40 },
    React.createElement(HoverCard.Trigger, { asChild: true }, React.createElement("a", { href: "/ada" }, "Ada")),
    React.createElement(HoverCard.Content, null, "Preview"));
  try {
    await React.act(async () => root.render(render(false)));
    const trigger = container.querySelector("a");
    trigger.matches = () => true;
    await actDispatch(() => trigger.focus());
    await React.act(async () => root.render(render(true)));
    await wait(80);
    assert.equal(container.querySelector("[data-slot='hover-card-content']"), null);
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

function setRect(element, rect) {
  element.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    toJSON() {},
    ...rect,
  });
}

function Fixture({ closeDelay = 30, onOpenChange }) {
  return React.createElement(
    HoverCard.Root,
    { closeDelay, openDelay: 0, onOpenChange },
    React.createElement(
      HoverCard.Trigger,
      { asChild: true },
      React.createElement("a", { href: "/people/ada" }, "Ada Lovelace"),
    ),
    React.createElement(
      HoverCard.Portal,
      { disabled: true },
      React.createElement(HoverCard.Content, null, "Profile preview"),
    ),
  );
}

test("HoverCard ignores touch and touch-generated compatibility mouse events", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      onOpenChange: (open) => changes.push(open),
    })));
    const trigger = container.querySelector("a");
    await actDispatch(() => {
      dispatchPointer(trigger, "pointerdown", "touch");
      dispatchPointer(trigger, "pointerover", "touch");
      dispatchMouse(trigger, "mouseover");
      dispatchMouse(trigger, "mouseenter");
    });
    await wait(20);
    assert.deepEqual(changes, []);
    assert.equal(container.textContent.includes("Profile preview"), false);
    assert.equal(trigger.getAttribute("href"), "/people/ada");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard ignores compatibility hover when Safari omits pointer metadata", async () => {
  const { container, dom, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      onOpenChange: (open) => changes.push(open),
    })));
    const trigger = container.querySelector("a");
    await actDispatch(() => {
      trigger.dispatchEvent(new dom.window.Event("touchstart", { bubbles: true }));
    });
    await wait(30);
    await actDispatch(() => dispatchMouse(trigger, "mouseenter"));
    await wait(20);

    assert.deepEqual(changes, []);
    assert.equal(container.textContent.includes("Profile preview"), false);
    assert.equal(trigger.getAttribute("href"), "/people/ada");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard never installs hover opening on a touch-only device", async () => {
  const { container, cleanup } = installDom({ hoverInput: false });
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      onOpenChange: (open) => changes.push(open),
    })));
    const trigger = container.querySelector("a");
    await actDispatch(() => dispatchMouse(trigger, "mouseenter"));
    await wait(20);

    assert.deepEqual(changes, []);
    assert.equal(container.textContent.includes("Profile preview"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard captures touch modality before compatibility mouseenter on a hybrid device", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      onOpenChange: (open) => changes.push(open),
    })));
    const trigger = container.querySelector("a");
    await actDispatch(() => {
      dispatchPointer(trigger, "pointerover", "touch");
      dispatchMouse(trigger, "mouseenter");
    });
    await wait(20);

    assert.deepEqual(changes, []);
    assert.equal(container.textContent.includes("Profile preview"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard ignores focus created by a touch interaction", async () => {
  const { container, dom, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      onOpenChange: (open) => changes.push(open),
    })));
    const trigger = container.querySelector("a");
    const originalMatches = trigger.matches.bind(trigger);
    trigger.matches = (selector) => selector === ":focus-visible" || originalMatches(selector);
    await actDispatch(() => {
      trigger.dispatchEvent(new dom.window.Event("touchstart", { bubbles: true }));
      trigger.focus();
    });
    await wait(20);

    assert.deepEqual(changes, []);
    assert.equal(container.textContent.includes("Profile preview"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard still opens for a mouse pointer", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(React.createElement(Fixture)));
    const trigger = container.querySelector("a");
    await actDispatch(() => {
      dispatchPointer(trigger, "pointerover", "mouse");
      dispatchMouse(trigger, "mouseenter");
    });
    await wait(20);
    assert.equal(container.textContent.includes("Profile preview"), true);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard remains open while the mouse crosses the safe corridor", async () => {
  const { container, dom, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      closeDelay: 10,
    })));
    const trigger = container.querySelector("a");
    setRect(trigger, { left: 100, top: 100, right: 200, bottom: 120 });

    await actDispatch(() => {
      dispatchPointer(trigger, "pointerover", "mouse");
      dispatchMouse(trigger, "mouseenter", { clientX: 150, clientY: 110 });
    });
    await wait(20);

    const content = container.querySelector("[data-slot='hover-card-content']");
    assert.ok(content);
    setRect(content, { left: 80, top: 140, right: 220, bottom: 220 });

    await actDispatch(() => {
      dispatchMouse(trigger, "mouseleave", {
        clientX: 150,
        clientY: 120,
        relatedTarget: dom.window.document.body,
      });
      dispatchMouse(dom.window.document, "mousemove", {
        clientX: 150,
        clientY: 130,
      });
      dispatchMouse(content, "mouseenter", { clientX: 150, clientY: 145 });
    });
    await wait(30);

    assert.equal(container.textContent.includes("Profile preview"), true);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("HoverCard closes when the mouse leaves outside the safe corridor", async () => {
  const { container, dom, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      closeDelay: 10,
    })));
    const trigger = container.querySelector("a");
    setRect(trigger, { left: 100, top: 100, right: 200, bottom: 120 });

    await actDispatch(() => {
      dispatchPointer(trigger, "pointerover", "mouse");
      dispatchMouse(trigger, "mouseenter", { clientX: 150, clientY: 110 });
    });
    await wait(20);

    const content = container.querySelector("[data-slot='hover-card-content']");
    setRect(content, { left: 80, top: 140, right: 220, bottom: 220 });
    await actDispatch(() => {
      dispatchMouse(trigger, "mouseleave", {
        clientX: 150,
        clientY: 120,
        relatedTarget: dom.window.document.body,
      });
      dispatchMouse(dom.window.document, "mousemove", {
        clientX: 20,
        clientY: 130,
      });
    });
    await wait(30);

    assert.equal(
      container.querySelector("[data-slot='hover-card-content']")?.getAttribute("data-state"),
      "closed",
    );
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
