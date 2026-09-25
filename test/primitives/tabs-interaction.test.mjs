import { test, assert, React, renderToStaticMarkup } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { Tabs, useTabs } from "../../dist/tabs.js";

const h = React.createElement;
function items(options = {}) {
  return h(
    Tabs.List,
    { ariaLabel: "Account" },
    ...["first", "second", "third"]
      .filter((value) => value !== options.remove)
      .map((value) =>
        h(
          Tabs.Trigger,
          { value, key: value, disabled: value === options.disabled },
          value,
        ),
      ),
  );
}
async function fixture(run) {
  const dom = new JSDOM("<div id='root'></div>", {
    url: "https://example.test/",
    pretendToBeVisual: true,
  });
  const saved = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    MutationObserver: dom.window.MutationObserver,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }
  const root = createRoot(document.getElementById("root"));
  try {
    await run({
      dom,
      render: async (element) => React.act(async () => root.render(element)),
      event: async (node, type, options = {}) => {
        const event =
          type === "keydown"
            ? new dom.window.KeyboardEvent(type, {
                bubbles: true,
                cancelable: true,
                ...options,
              })
            : new dom.window.MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                ...options,
              });
        await React.act(async () => node.dispatchEvent(event));
        return event;
      },
    });
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved)
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key];
  }
}
test("SSR uses safe linked IDs and honors explicit part IDs", () => {
  const html = renderToStaticMarkup(
    h(
      Tabs.Root,
      { value: "hello world", id: "test" },
      h(Tabs.List, null, h(Tabs.Trigger, { value: "hello world" }, "Hello")),
      h(Tabs.Content, { value: "hello world" }, "Panel"),
    ),
  );
  const dom = new JSDOM(html),
    tab = dom.window.document.querySelector('[role="tab"]');
  assert.ok(!/\s/.test(tab.id));
  assert.ok(
    dom.window.document.getElementById(tab.getAttribute("aria-controls")),
  );
  const custom = renderToStaticMarkup(
    h(
      Tabs.Root,
      { ids: { root: "custom-root", trigger: () => "custom-trigger" } },
      h(Tabs.Trigger, { value: "a" }, "A"),
    ),
  );
  assert.match(custom, /id="custom-root"/);
  assert.match(custom, /id="custom-trigger"/);
  dom.window.close();
});
test("disabled composed anchors have no href, button attributes or activation", async () =>
  fixture(async ({ render, event }) => {
    let calls = 0;
    await render(
      h(
        Tabs.Root,
        { onValueChange: () => calls++ },
        h(
          Tabs.List,
          null,
          h(
            Tabs.Trigger,
            { value: "a", disabled: true, asChild: true },
            h("a", { href: "#a" }, "A"),
          ),
        ),
      ),
    );
    const node = document.querySelector("a");
    assert.equal(node.hasAttribute("href"), false);
    assert.equal(node.hasAttribute("disabled"), false);
    assert.equal(node.hasAttribute("type"), false);
    assert.equal(node.tabIndex, -1);
    assert.equal((await event(node, "click")).defaultPrevented, true);
    assert.equal(calls, 0);
  }));
test("manual navigation, loopFocus and removed/disabled active values preserve an entry point", async () =>
  fixture(async ({ render, event }) => {
    const mount = (options) =>
      render(
        h(
          Tabs.Root,
          { value: "first", activationMode: "manual", loopFocus: false },
          items(options),
        ),
      );
    await mount({});
    let tabs = document.querySelectorAll('[role="tab"]');
    await React.act(async () => tabs[0].focus());
    await event(tabs[0], "keydown", { key: "ArrowRight" });
    assert.equal(document.activeElement, tabs[1]);
    assert.equal(tabs[0].getAttribute("aria-selected"), "true");
    await event(tabs[1], "keydown", { key: "End" });
    await event(tabs[2], "keydown", { key: "ArrowRight" });
    assert.equal(document.activeElement, tabs[2]);
    await mount({ disabled: "first" });
    assert.equal(document.querySelector('[data-value="second"]').tabIndex, 0);
    await mount({ remove: "first" });
    assert.equal(document.querySelector('[data-value="second"]').tabIndex, 0);
  }));
test("controller/provider, focus callback and deselection share one state", async () =>
  fixture(async ({ render, event }) => {
    let api;
    const focused = [];
    function Example() {
      api = useTabs({
        defaultValue: "first",
        deselectable: true,
        onFocusChange: (details) => focused.push(details.focusedValue),
      });
      return h(
        Tabs.RootProvider,
        { value: api },
        items(),
        h(Tabs.Context, null, (state) => h("output", null, state.value)),
      );
    }
    await render(h(Example));
    await event(document.querySelector('[data-value="first"]'), "click");
    assert.equal(api.value, "");
    await React.act(async () => api.setValue("second"));
    assert.equal(document.querySelector("output").textContent, "second");
    await React.act(async () => api.focus("third"));
    assert.equal(document.activeElement.dataset.value, "third");
    assert.ok(focused.includes("third"));
  }));
test("explicit lazy retention mounts once, keeps input state and hides inactive panels", async () =>
  fixture(async ({ render, event }) => {
    await render(
      h(
        Tabs.Root,
        { defaultValue: "first", lazyMount: true, unmountOnExit: false },
        items(),
        h(Tabs.Content, { value: "first" }, "Text"),
        h(
          Tabs.Content,
          { value: "second" },
          h("input", { defaultValue: "retained" }),
        ),
      ),
    );
    assert.equal(document.querySelectorAll('[role="tabpanel"]').length, 1);
    await event(document.querySelector('[data-value="second"]'), "click");
    const input = document.querySelector("input");
    assert.ok(input);
    assert.equal(input.parentElement.hasAttribute("tabindex"), false);
    await event(document.querySelector('[data-value="first"]'), "click");
    await React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 80)),
    );
    assert.equal(document.querySelector("input"), input);
    assert.equal(input.parentElement.hidden, true);
  }));

test("nested keyboard events do not change the outer selection", async () =>
  fixture(async ({ render, event }) => {
    await render(
      h(
        Tabs.Root,
        { defaultValue: "first" },
        items(),
        h(
          Tabs.Content,
          { value: "first" },
          h(Tabs.Root, { defaultValue: "first", id: "nested" }, items()),
        ),
      ),
    );
    const nested = document.getElementById("nested");
    const first = nested.querySelector('[role="tab"]');
    await React.act(async () => first.focus());
    await event(first, "keydown", { key: "ArrowRight" });
    assert.equal(
      nested
        .querySelector('[data-value="second"]')
        .getAttribute("aria-selected"),
      "true",
    );
    assert.equal(
      document.querySelector('[role="tab"]').getAttribute("aria-selected"),
      "true",
    );
  }));

test("iframe keyboard ownership and measured indicator refs use the owner document", async () =>
  fixture(async ({ render }) => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const owner = frame.contentDocument,
      view = frame.contentWindow;
    const indicatorRef = React.createRef();
    await render(
      createPortal(
        h(
          Tabs.Root,
          { defaultValue: "first" },
          h(
            Tabs.List,
            null,
            h(Tabs.Trigger, { value: "first" }, "First"),
            h(Tabs.Trigger, { value: "second" }, "Second"),
            h(Tabs.Indicator, {
              ref: indicatorRef,
              "data-slot": "custom-indicator",
            }),
          ),
        ),
        owner.body,
      ),
    );
    const tabs = owner.querySelectorAll('[role="tab"]'),
      list = owner.querySelector('[role="tablist"]');
    for (const [index, tab] of [...tabs].entries()) {
      for (const [key, value] of Object.entries({
        offsetLeft: index * 100,
        offsetTop: 0,
        offsetWidth: 100,
        offsetHeight: 40,
        offsetParent: list,
      }))
        Object.defineProperty(tab, key, { configurable: true, value });
    }
    await React.act(async () => tabs[0].focus());
    await React.act(async () =>
      tabs[0].dispatchEvent(
        new view.KeyboardEvent("keydown", {
          key: "ArrowRight",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    assert.equal(owner.activeElement, tabs[1]);
    assert.equal(tabs[1].getAttribute("aria-selected"), "true");
    assert.equal(indicatorRef.current.ownerDocument, owner);
    assert.equal(
      indicatorRef.current.style.getPropertyValue("--tabs-indicator-left"),
      "100px",
    );
    assert.equal(
      indicatorRef.current.style.getPropertyValue("--tabs-indicator-width"),
      "100px",
    );
    await render(null);
    frame.remove();
  }));
