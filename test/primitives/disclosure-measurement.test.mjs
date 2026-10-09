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
  const frames = new Map();
  let nextFrame = 0;
  dom.window.requestAnimationFrame = callback => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  };
  dom.window.cancelAnimationFrame = id => frames.delete(id);
  const flushFrames = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(0));
  };
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
    await run(dom, observers, { frames, flushFrames, root });
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

test("Accordion exit isolates child animations and immediately hides interactive descendants", async (context) => {
  let exits = 0;
  await withDom(React.createElement(Accordion.Root, {defaultValue:"one",onExitComplete:()=>exits++},
    React.createElement(Accordion.Item,{value:"one"},
      React.createElement(Accordion.Header,null,React.createElement(Accordion.Trigger,null,"Question")),
      React.createElement(Accordion.Content,{style:{animationName:"owned-exit",animationDuration:"0.2s"}},React.createElement("button",null,"Inner")))), async dom => {
    const trigger=dom.window.document.querySelector('[data-slot="accordion-trigger"]');
    const content=dom.window.document.querySelector('[data-slot="accordion-content"]');
    const child=content.querySelector("button");
    context.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1000 });
    await React.act(async()=>trigger.click());
    assert.equal(content.getAttribute("aria-hidden"),"true");
    assert.ok(content.hasAttribute("inert"));
    await React.act(async()=>child.dispatchEvent(new dom.window.Event("animationend",{bubbles:true})));
    assert.ok(content.isConnected,"child event must not finish panel exit");
    await React.act(async()=>trigger.click());
    await React.act(async()=>context.mock.timers.tick(280));
    assert.ok(content.isConnected,"reopening cancels exit removal");
    assert.equal(exits,0);
  });
});

test("Collapsible keeps content size variables synchronized with intrinsic resizing", async () => {
  await withDom(
    React.createElement(
      Collapsible.Root,
      { defaultOpen: true },
      React.createElement(Collapsible.Trigger, null, "Advanced settings"),
      React.createElement(Collapsible.Content, null, "Settings content"),
    ),
    async (dom, observers, { flushFrames }) => {
      const content = dom.window.document.querySelector('[data-slot="collapsible-content"]');
      let height = 120;
      let width = 280;
      setMeasuredSize(content, () => height, () => width);
      const observer = observers.find((entry) => entry.targets.has(content));
      assert.ok(observer, "Collapsible Content is observed while mounted");

      await React.act(async () => observer.callback([]));
      flushFrames();
      assert.equal(content.style.getPropertyValue("--content-height"), "120px");
      assert.equal(content.style.getPropertyValue("--content-width"), "280px");

      height = 208;
      width = 416;
      await React.act(async () => observer.callback([]));
      flushFrames();
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
    async (dom, observers, { flushFrames }) => {
      const content = dom.window.document.querySelector('[data-slot="accordion-content"]');
      let height = 96;
      let width = 320;
      setMeasuredSize(content, () => height, () => width);
      const observer = observers.find((entry) => entry.targets.has(content));
      assert.ok(observer, "Accordion Content is observed while mounted");

      await React.act(async () => observer.callback([]));
      flushFrames();
      assert.equal(content.style.getPropertyValue("--content-height"), "96px");
      assert.equal(content.style.getPropertyValue("--content-width"), "320px");

      height = 176;
      width = 512;
      await React.act(async () => observer.callback([]));
      flushFrames();
      assert.equal(content.style.getPropertyValue("--content-height"), "176px");
      assert.equal(content.style.getPropertyValue("--content-width"), "512px");
    },
  );
});

test("disclosure resize delivery coalesces writes and cancels stale work on unmount", async () => {
  await withDom(React.createElement(Collapsible.Root, { defaultOpen: true },
    React.createElement(Collapsible.Trigger, null, "Details"),
    React.createElement(Collapsible.Content, null, "Content")),
  async (dom, observers, { frames, flushFrames, root }) => {
    const content = dom.window.document.querySelector('[data-slot="collapsible-content"]');
    const observer = observers.find(entry => entry.targets.has(content));
    let height = 120;
    setMeasuredSize(content, () => height, () => 280);
    const before = content.style.cssText;
    observer.callback([]);
    height = 208;
    observer.callback([]);
    assert.equal(content.style.cssText, before, "no layout write during observer delivery");
    assert.equal(frames.size, 1, "one coalesced frame");
    flushFrames();
    assert.equal(content.style.getPropertyValue("--content-height"), "208px");
    let writes = 0;
    const setProperty = content.style.setProperty.bind(content.style);
    content.style.setProperty = (...args) => { writes++; setProperty(...args); };
    observer.callback([]);
    flushFrames();
    assert.equal(writes, 0, "unchanged dimensions do not invalidate style");
    height = 300;
    observer.callback([]);
    await React.act(async () => root.render(null));
    assert.equal(frames.size, 0, "unmount cancels pending measurement");
    observer.callback([]);
    flushFrames();
    assert.equal(writes, 0, "stale delivery cannot write after cleanup");
  });
});
