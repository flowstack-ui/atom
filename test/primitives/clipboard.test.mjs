import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Clipboard, ClipboardRoot } from "../../dist/index.js";
import { Clipboard as ClipboardSubpath } from "../../dist/clipboard.js";

function Fixture(props = {}) {
  return React.createElement(
    Clipboard.Root,
    { defaultValue: "npm install @flowstack-ui/atom", ...props },
    React.createElement(Clipboard.Label, null, "Command"),
    React.createElement(
      Clipboard.Control,
      null,
      React.createElement(Clipboard.Input, null),
      React.createElement(Clipboard.Trigger, null, "Copy"),
    ),
    React.createElement(Clipboard.ValueText, null),
    React.createElement(
      Clipboard.Status,
      null,
      React.createElement(Clipboard.Indicator, { when: "idle" }, "Ready"),
      React.createElement(Clipboard.Indicator, { when: "copying" }, "Copying"),
      React.createElement(Clipboard.Indicator, { when: "copied" }, "Copied"),
      React.createElement(Clipboard.Indicator, { when: "error" }, "Failed"),
    ),
  );
}

test("Clipboard renders coordinated native anatomy and exports", () => {
  const html = renderToStaticMarkup(React.createElement(Fixture));
  const inputId = html.match(/<input id="([^"]+)"/)?.[1];
  assert.ok(inputId);
  assert.match(html, new RegExp(`<label id="[^"]+" for="${inputId}"`));
  assert.match(html, /<button type="button" data-slot="clipboard-trigger" data-state="idle">Copy/);
  assert.match(html, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(html, /data-slot="clipboard-indicator" data-state="idle">Ready/);
  assert.doesNotMatch(html, />Copied</);
  assert.equal(Clipboard.Root, ClipboardRoot);
  assert.equal(ClipboardSubpath.Root, ClipboardRoot);
});

test("Clipboard exposes disabled native and data state", () => {
  const html = renderToStaticMarkup(React.createElement(Fixture, { disabled: true }));
  assert.match(html, /data-slot="clipboard" data-state="idle" data-disabled=""/);
  assert.match(html, /<input[^>]+disabled=""/);
  assert.match(html, /<button type="button" disabled=""/);
});

function installDom() {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://example.test/" });
  const saved = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      dom.window.close();
      for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

async function click(element) {
  await React.act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
  });
}

test("Clipboard writes the current value and exposes copied state", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const writes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      value: "edited command",
      timeout: 60_000,
      writeValue: async (value) => writes.push(value),
    })));
    await click(container.querySelector("button"));
    assert.deepEqual(writes, ["edited command"]);
    assert.equal(container.querySelector("[data-slot='clipboard']").dataset.state, "copied");
    assert.equal(container.querySelector("[role='status']").textContent, "Copied");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Clipboard resets copied state after its timeout", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      timeout: 5,
      writeValue: async () => {},
    })));
    await click(container.querySelector("button"));
    await React.act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    assert.equal(container.querySelector("[data-slot='clipboard']").dataset.state, "idle");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Clipboard reports rejection and ignores stale completions", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const resolvers = [];
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      timeout: 100,
      onStatusChange: (details) => changes.push(details.status),
      writeValue: () => new Promise((resolve, reject) => resolvers.push({ resolve, reject })),
    })));
    await click(container.querySelector("button"));
    await click(container.querySelector("button"));
    await React.act(async () => resolvers[0].resolve());
    assert.equal(container.querySelector("[data-slot='clipboard']").dataset.state, "copying");
    await React.act(async () => resolvers[1].reject(new Error("denied")));
    assert.equal(container.querySelector("[data-slot='clipboard']").dataset.state, "error");
    assert.equal(container.querySelector("[role='status']").textContent, "Failed");
    assert.deepEqual(changes.slice(0, 3), ["copying", "copying", "error"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Clipboard consumer cancellation blocks copying and composition keeps semantics", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  let writes = 0;
  try {
    await React.act(async () => root.render(
      React.createElement(
        Clipboard.Root,
        { value: "value", writeValue: () => { writes += 1; } },
        React.createElement(
          Clipboard.Trigger,
          { asChild: true, onClick: (event) => event.preventDefault() },
          React.createElement("span", null, "Copy"),
        ),
      ),
    ));
    const trigger = container.querySelector("span");
    assert.equal(trigger.getAttribute("role"), "button");
    assert.equal(trigger.tabIndex, 0);
    await click(trigger);
    assert.equal(writes, 0);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
