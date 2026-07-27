import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Accordion, Collapsible } from "../../dist/index.js";

async function withDom(element, run) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    { pretendToBeVisual: true, url: "https://atom.test/" },
  );
  const observers = [];
  class TestResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();
      observers.push(this);
    }
    observe(target) { this.targets.add(target); }
    disconnect() { this.targets.clear(); }
  }
  const saved = new Map();
  const globals = {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    ResizeObserver: TestResizeObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }

  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await React.act(async () => {
      root.render(element);
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await run(dom, observers);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function setMeasuredSize(element, getHeight, getWidth) {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    get: getHeight,
  });
  Object.defineProperty(element, "scrollWidth", {
    configurable: true,
    get: getWidth,
  });
}

test("Collapsible keeps content size variables synchronized with intrinsic resizing", async () => {
  await withDom(
    React.createElement(
      Collapsible.Root,
      { defaultOpen: true },
      React.createElement(Collapsible.Trigger, null, "Advanced settings"),
      React.createElement(Collapsible.Content, null, "Settings content"),
    ),
    async (dom, observers) => {
      const content = dom.window.document.querySelector('[data-slot="collapsible-content"]');
      let height = 120;
      let width = 280;
      setMeasuredSize(content, () => height, () => width);
      const observer = observers.find((entry) => entry.targets.has(content));
      assert.ok(observer, "Collapsible Content is observed while mounted");

      await React.act(async () => observer.callback([]));
      assert.equal(content.style.getPropertyValue("--content-height"), "120px");
      assert.equal(content.style.getPropertyValue("--content-width"), "280px");

      height = 208;
      width = 416;
      await React.act(async () => observer.callback([]));
      assert.equal(content.style.getPropertyValue("--content-height"), "208px");
      assert.equal(content.style.getPropertyValue("--content-width"), "416px");
    },
  );
});

test("Accordion keeps each content size variable synchronized with intrinsic resizing", async () => {
  await withDom(
    React.createElement(
      Accordion.Root,
      { defaultValue: "shipping" },
      React.createElement(
        Accordion.Item,
        { value: "shipping" },
        React.createElement(
          Accordion.Header,
          null,
          React.createElement(Accordion.Trigger, null, "Shipping"),
        ),
        React.createElement(Accordion.Content, null, "Shipping details"),
      ),
    ),
    async (dom, observers) => {
      const content = dom.window.document.querySelector('[data-slot="accordion-content"]');
      let height = 96;
      let width = 320;
      setMeasuredSize(content, () => height, () => width);
      const observer = observers.find((entry) => entry.targets.has(content));
      assert.ok(observer, "Accordion Content is observed while mounted");

      await React.act(async () => observer.callback([]));
      assert.equal(content.style.getPropertyValue("--content-height"), "96px");
      assert.equal(content.style.getPropertyValue("--content-width"), "320px");

      height = 176;
      width = 512;
      await React.act(async () => observer.callback([]));
      assert.equal(content.style.getPropertyValue("--content-height"), "176px");
      assert.equal(content.style.getPropertyValue("--content-width"), "512px");
    },
  );
});
