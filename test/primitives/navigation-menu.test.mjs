import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Direction,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  getNavigationMenuGeometry,
  getNavigationMenuGeometryStyle,
  getNavigationMenuViewportPosition,
  getNavigationMenuViewportPositionStyle,
  getNavigationMenuViewportSizeStyle,
} from "../../dist/index.js";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { useNavigationMenu, useNavigationMenuContext, NavigationMenuRootProvider, NavigationMenuItemIndicator } from "../../dist/navigation-menu.js";

test("NavigationMenu public context hook exposes only state and actions", async () => {
  await withNavigationDom(async root => {
    let api;
    function Read() { api = useNavigationMenuContext(); return null; }
    await React.act(async () => root.render(h(NavigationMenuRoot, null, h(Read))));
    assert.deepEqual(Object.keys(api).sort(), ["value", "open", "orientation", "setValue", "isViewportRendered", "getViewportNode", "reposition"].sort());
    await React.act(async () => api.setValue("one"));
    assert.equal(api.value, "one");
    assert.equal(api.open, true);
    assert.equal(api.getViewportNode(), null);
    assert.doesNotThrow(() => api.reposition());
  });
});

test("NavigationMenu explicit lifecycle overrides forceMount while omitted policy preserves it", async () => {
  await withNavigationDom(async (root, view) => {
    const render = props => h(NavigationMenuRoot, props, h(NavigationMenuViewport, { forceMount: true }));
    await React.act(async () => root.render(render({})));
    assert.ok(view.document.querySelector('[data-slot="navigation-menu-viewport"]'));
    await React.act(async () => root.render(render({ lazyMount: true, unmountOnExit: true })));
    assert.equal(view.document.querySelector('[data-slot="navigation-menu-viewport"]'), null);
    await React.act(async () => root.render(render({ lazyMount: false })));
    assert.ok(view.document.querySelector('[data-slot="navigation-menu-viewport"]'));
  });
});

async function withNavigationDom(run) {
  const dom = new JSDOM("<div id='test'></div><button id='outside'>Outside</button>", { url: "https://example.test", pretendToBeVisual: true });
  // React DOM is imported before this per-test document, so its input fallback
  // detects a legacy host. Supply the no-op event hooks only in this JSDOM realm.
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  const previous = new Map();
  for (const name of ["window", "document", "Node", "Element", "HTMLElement", "HTMLButtonElement", "MutationObserver", "Event", "FocusEvent", "KeyboardEvent", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: typeof dom.window[name] === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(name) ? dom.window[name].bind(dom.window) : dom.window[name] });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(dom.window.document.getElementById("test"));
  try { await run(root, dom.window); }
  finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
}
const h = React.createElement;
test("NavigationMenu exposes paired exchange directions and explicit navigation anchoring", async () => {
  await withNavigationDom(async (root, view) => {
    const render = value => h(NavigationMenuRoot, { value, unmountOnExit: false },
      h(NavigationMenuList, null, ...["one", "two"].map(value =>
        h(NavigationMenuItem, { key: value, value },
          h(NavigationMenuTrigger, null, value),
          h(NavigationMenuContent, null, h("a", { href: `#${value}` }, value))))),
      h(NavigationMenuViewport, { anchor: "navigation" }));
    await React.act(async () => root.render(render("one")));
    await React.act(async () => root.render(render("two")));
    const panel = value => view.document.querySelector(`[data-slot="navigation-menu-content"][data-value="${value}"]`);
    assert.equal(panel("one").dataset.motion, "to-start");
    assert.equal(panel("two").dataset.motion, "from-end");
    assert.equal(panel("one").getAttribute("aria-hidden"), "true");
    assert.ok(panel("one").hasAttribute("inert"));
    assert.equal(view.document.querySelector('[data-slot="navigation-menu-viewport"]').dataset.anchor, "navigation");
    await React.act(async () => root.render(render("one")));
    assert.equal(panel("one").dataset.motion, "from-start");
    assert.equal(panel("two").dataset.motion, "to-end");
  });
});
for (const viewport of [false, true]) {
  test(`NavigationMenu ${viewport ? "shared" : "inline"} panels preserve field keys and Escape`, async () => {
    await withNavigationDom(async (root, view) => {
      await React.act(async () => root.render(h(NavigationMenuRoot, { defaultValue: "one", viewport },
        h(NavigationMenuList, null, h(NavigationMenuItem, { value: "one" },
          h(NavigationMenuTrigger, null, "One"),
          h(NavigationMenuContent, null,
            h("a", { href: "#first" }, "First"),
            h("input", { "aria-label": "Text" }),
            h("input", { type: "number", "aria-label": "Number" }),
            h("textarea", { "aria-label": "Notes" }),
            h("select", { "aria-label": "Choice" }, h("option", null, "One")),
            h("div", { contentEditable: true, tabIndex: 0, "aria-label": "Editor" }),
            h("a", { href: "#last" }, "Last")))),
        viewport ? h(NavigationMenuViewport) : null)));
      await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
      for (const label of ["Text", "Number", "Notes", "Choice", "Editor"]) {
        const field = view.document.querySelector(`[aria-label="${label}"]`);
        await React.act(async () => field.focus());
        for (const key of ["Home", "End", "ArrowUp", "ArrowDown"]) {
          const event = new view.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
          await React.act(async () => field.dispatchEvent(event));
          assert.equal(event.defaultPrevented, false, `${label} retains ${key}`);
          assert.equal(view.document.activeElement, field);
        }
      }
      await React.act(async () => view.document.activeElement.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
      assert.equal(view.document.querySelector("button").getAttribute("aria-expanded"), "false");
      assert.equal(view.document.activeElement, view.document.querySelector("button"));
    });
  });
}
test("NavigationMenu resolves measured and keyboard panel hosts inside a ShadowRoot", async () => {
  await withNavigationDom(async (_root, view) => {
    const host = view.document.createElement("div");
    view.document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const shadowRoot = createRoot(shadow);
    try {
      await React.act(async () => shadowRoot.render(runtimeMenu({ defaultValue: "one" })));
      await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
      const viewport = shadow.querySelector('[data-slot="navigation-menu-viewport"]');
      assert.equal(viewport.style.getPropertyValue("--atom-navigation-menu-trigger-left"), "0px");
      const trigger = shadow.querySelector("button");
      await React.act(async () => trigger.dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })));
      await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
      assert.equal(shadow.activeElement, shadow.querySelector("input"));
    } finally {
      await React.act(async () => shadowRoot.unmount());
      host.remove();
    }
  });
});
function runtimeMenu(rootProps = {}, contentProps = {}, linkProps = {}) {
  return h(NavigationMenuRoot, rootProps,
    h(NavigationMenuList, null, h(NavigationMenuItem, { value: "one" },
      h(NavigationMenuTrigger, null, "One"),
      h(NavigationMenuContent, contentProps, h("input", { "aria-label": "Retained" }), h(NavigationMenuLink, { href: "#one", ...linkProps }, "Destination")))),
    rootProps.viewport === false ? null : h(NavigationMenuViewport));
}

test("NavigationMenu real content refs, inline rendering, selection cancellation and persistence", async () => {
  await withNavigationDom(async (root, view) => {
    let node;
    const contentRef = value => { node = value; };
    await React.act(async () => root.render(runtimeMenu({ viewport: false, defaultValue: "one", unmountOnExit: false }, { ref: contentRef }, { onSelect: event => event.preventDefault() })));
    assert.equal(node?.tagName, "DIV");
    await React.act(async () => view.document.querySelector("a").click());
    assert.equal(node.dataset.state, "open");
    const input = node.querySelector("input"); input.value = "retained";
    await React.act(async () => view.document.querySelector("nav button").click());
    assert.equal(node.dataset.state, "closed");
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 100)); });
    assert.equal(node.hidden, true);
    await React.act(async () => view.document.querySelector("nav button").click());
    assert.equal(node.querySelector("input"), input);
    assert.equal(input.value, "retained");
  });
});

test("NavigationMenu cancels focus-out and keeps keyboard opening when pointer click is disabled", async () => {
  await withNavigationDom(async (root, view) => {
    await React.act(async () => root.render(runtimeMenu({ disableClickTrigger: true, disableHoverTrigger: true }, { onFocusOutside: event => event.preventDefault() })));
    const trigger = view.document.querySelector("nav button");
    await React.act(async () => trigger.dispatchEvent(new view.MouseEvent("click", { bubbles: true, detail: 1 })));
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    await React.act(async () => trigger.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => view.document.getElementById("outside").focus());
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
  });
});

test("NavigationMenu controller exposes root state and per-item indicator state", async () => {
  await withNavigationDom(async (root, view) => {
    let api;
    function Example() {
      api = useNavigationMenu({ disableHoverTrigger: true });
      return h(NavigationMenuRootProvider, { value: api }, h(NavigationMenuList, null,
        h(NavigationMenuItem, { value: "one" }, h(NavigationMenuTrigger, null, "One", h(NavigationMenuItemIndicator, null, "+")),
          h(NavigationMenuContent, null, "Content"))), h(NavigationMenuViewport));
    }
    await React.act(async () => root.render(h(Example)));
    await React.act(async () => api.setValue("one"));
    assert.equal(api.open, true);
    assert.equal(api.getViewportNode()?.dataset.state, "open");
    assert.equal(view.document.querySelector('[data-slot="navigation-menu-item-indicator"]').dataset.state, "open");
  });
});

test("NavigationMenu viewport alignment follows logical start/end before collision", () => {
  const base = { rootRect: { left: 0, top: 0, width: 600, height: 40 }, triggerRect: { left: 200, top: 0, width: 100, height: 40 }, viewportWidth: 180, boundaryRect: { left: 0, width: 600 } };
  assert.equal(getNavigationMenuViewportPosition({ ...base, align: "start" }).left, 200);
  assert.equal(getNavigationMenuViewportPosition({ ...base, align: "start", dir: "rtl" }).left, 120);
  assert.equal(getNavigationMenuViewportPosition({ ...base, align: "end" }).left, 120);
});

test("NavigationMenu independent delays and pointer-leave policy preserve open state", async () => {
  await withNavigationDom(async (root, view) => {
    await React.act(async () => root.render(runtimeMenu({ openDelay: 0, closeDelay: 5, delayDuration: 1000, disablePointerLeaveClose: true })));
    const trigger = view.document.querySelector("nav button");
    const pointer = type => {
      const event = new view.MouseEvent(type, { bubbles: true, relatedTarget: view.document.getElementById("outside") });
      Object.defineProperty(event, "pointerType", { value: "mouse" }); return event;
    };
    await React.act(async () => trigger.dispatchEvent(pointer("pointerover")));
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => { trigger.dispatchEvent(pointer("pointerout")); await new Promise(resolve => setTimeout(resolve, 20)); });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => root.render(runtimeMenu({ openDelay: 0, closeDelay: 5, delayDuration: 1000 })));
    await React.act(async () => { trigger.dispatchEvent(pointer("pointerout")); await new Promise(resolve => setTimeout(resolve, 20)); });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });
});

test("NavigationMenu keyboard entry supersedes a pending pointer close", async () => {
  await withNavigationDom(async (root, view) => {
    await React.act(async () => root.render(runtimeMenu({ defaultValue: "one", closeDelay: 20 })));
    const trigger = view.document.querySelector("nav button");
    const leave = new view.MouseEvent("pointerout", { bubbles: true, relatedTarget: view.document.getElementById("outside") });
    Object.defineProperty(leave, "pointerType", { value: "mouse" });
    await React.act(async () => {
      trigger.dispatchEvent(leave);
      trigger.focus();
      trigger.dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 60)); });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
  });
});

test("NavigationMenu inline pointer boundary cancels entry timers and respects leave policy", async () => {
  await withNavigationDom(async (root, view) => {
    const render = (policy = false, content = {}) => runtimeMenu({ viewport: false, defaultValue: "one", closeDelay: 10, disablePointerLeaveClose: policy }, content);
    await React.act(async () => root.render(render()));
    const trigger = view.document.querySelector("nav button");
    const panel = view.document.querySelector('[data-slot="navigation-menu-content"]');
    const pointer = (type, relatedTarget, pointerType = "mouse") => {
      const event = new view.MouseEvent(type, { bubbles: true, relatedTarget });
      Object.defineProperty(event, "pointerType", { value: pointerType });
      return event;
    };
    await React.act(async () => {
      trigger.dispatchEvent(pointer("pointerout", panel));
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => root.render(render(true)));
    await React.act(async () => {
      panel.dispatchEvent(pointer("pointerout", view.document.getElementById("outside")));
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => root.render(render(false, { onPointerLeave: event => event.preventDefault() })));
    await React.act(async () => {
      panel.dispatchEvent(pointer("pointerout", view.document.getElementById("outside")));
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => root.render(render()));
    await React.act(async () => {
      panel.dispatchEvent(pointer("pointerout", view.document.getElementById("outside"), "touch"));
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    await React.act(async () => {
      panel.dispatchEvent(pointer("pointerout", view.document.getElementById("outside")));
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });
});

test("NavigationMenu indicator presence preserves exit geometry and forceMount host", async () => {
  await withNavigationDom(async (root, view) => {
    const render = (value, forceMount = false) => h(NavigationMenuRoot, { value },
      h(NavigationMenuList, null, h(NavigationMenuItem, { value: "one" },
        h(NavigationMenuTrigger, null, "One"), h(NavigationMenuContent, null, "Content"))),
      h(NavigationMenuIndicator, { forceMount, style: { transitionProperty: "opacity", transitionDuration: "40ms" } }),
      h(NavigationMenuViewport));
    await React.act(async () => root.render(render("one")));
    const indicator = view.document.querySelector('[data-slot="navigation-menu-indicator"]');
    const geometry = indicator.style.getPropertyValue('--atom-navigation-menu-trigger-center-x');
    await React.act(async () => root.render(render(null)));
    assert.ok(indicator.isConnected);
    assert.equal(indicator.dataset.state, "hidden");
    assert.equal(indicator.style.getPropertyValue('--atom-navigation-menu-trigger-center-x'), geometry);
    await React.act(async () => root.render(render("one")));
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
    assert.ok(indicator.isConnected);
    assert.equal(indicator.dataset.state, "visible");
    await React.act(async () => root.render(render(null)));
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
    assert.equal(indicator.isConnected, false);
    await React.act(async () => root.render(render("one", true)));
    await React.act(async () => root.render(render(null, true)));
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
    assert.equal(view.document.querySelector('[data-slot="navigation-menu-indicator"]').hidden, true);
  });
});

test("NavigationMenu observes captured ancestor scroll only while open", async () => {
  await withNavigationDom(async (root, view) => {
    const render = value => h("div", { id: "scroller" }, runtimeMenu({ value, orientation: "vertical" }));
    await React.act(async () => root.render(render("one")));
    const nav = view.document.querySelector("nav");
    let reads = 0;
    const measure = nav.getBoundingClientRect.bind(nav);
    nav.getBoundingClientRect = () => { reads++; return measure(); };
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
    reads = 0;
    await React.act(async () => {
      for (let i = 0; i < 5; i++) view.document.getElementById("scroller").dispatchEvent(new view.Event("scroll"));
      await new Promise(resolve => setTimeout(resolve, 40));
    });
    assert.equal(reads, 1, "non-bubbling ancestor scrolls coalesce into one measurement");
    await React.act(async () => root.render(render(null)));
    reads = 0;
    await React.act(async () => {
      view.document.getElementById("scroller").dispatchEvent(new view.Event("scroll"));
      await new Promise(resolve => setTimeout(resolve, 40));
    });
    assert.equal(reads, 0, "closed panels remove scroll subscriptions");
  });
});

test("NavigationMenu indicator observes viewport layout bounds without reading animated transforms", async () => {
  await withNavigationDom(async (root, view) => {
    await React.act(async () => root.render(h(NavigationMenuRoot, { defaultValue: "one" },
      h(NavigationMenuList, null, h(NavigationMenuItem, { value: "one" },
        h(NavigationMenuTrigger, null, "One"), h(NavigationMenuContent, null, "Content"))),
      h(NavigationMenuIndicator), h(NavigationMenuViewport))));
    const viewport = view.document.querySelector('[data-slot="navigation-menu-viewport"]');
    const indicator = view.document.querySelector('[data-slot="navigation-menu-indicator"]');
    Object.defineProperty(viewport, 'offsetLeft', { configurable: true, value: 90 });
    Object.defineProperty(viewport, 'offsetWidth', { configurable: true, value: 120 });
    await React.act(async () => { viewport.style.transform = 'scale(.5)'; await Promise.resolve(); });
    assert.equal(indicator.style.getPropertyValue('--atom-navigation-menu-viewport-start'), '90px');
    assert.equal(indicator.style.getPropertyValue('--atom-navigation-menu-viewport-end'), '210px');
  });
});

test("NavigationMenu prevents native click selection and supports closeOnClick=false", async () => {
  await withNavigationDom(async (root, view) => {
    let selected = 0;
    await React.act(async () => root.render(runtimeMenu({ defaultValue: "one" }, {}, { onClick: event => event.preventDefault(), onSelect: () => selected++ })));
    await React.act(async () => view.document.querySelector("a").click());
    assert.equal(selected, 0);
    assert.equal(view.document.querySelector("nav button").getAttribute("aria-expanded"), "true");
    await React.act(async () => root.render(runtimeMenu({ defaultValue: "one" }, {}, { closeOnClick: false, onSelect: () => selected++ })));
    await React.act(async () => view.document.querySelector("a").click());
    assert.equal(selected, 1);
    assert.equal(view.document.querySelector("nav button").getAttribute("aria-expanded"), "true");
  });
});

test("NavigationMenu primitives render landmark, trigger, link, and active viewport content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        "aria-label": "Primary",
        id: "main-navigation",
        style: { color: "blue" },
        "data-testid": "navigation-root",
        className: "navigation-root-class",
      },
      React.createElement(
        NavigationMenuList,
        { className: "navigation-list-class", "data-testid": "navigation-list" },
        React.createElement(
          NavigationMenuItem,
          {
            value: "products",
            className: "navigation-item-class",
            title: "Products item",
          },
          React.createElement(
            NavigationMenuTrigger,
            {
              className: "navigation-trigger-class",
              "data-testid": "navigation-trigger",
            },
            "Products",
          ),
          React.createElement(
            NavigationMenuContent,
            {
              className: "navigation-content-class",
              "data-testid": "navigation-content",
            },
            React.createElement("span", null, "Product panel"),
          ),
        ),
        React.createElement(
        NavigationMenuItem,
        { value: "docs" },
          React.createElement(
          NavigationMenuLink,
            {
              href: "/docs",
              active: true,
              className: "navigation-link-class",
              target: "_blank",
              rel: "noreferrer",
              "data-testid": "navigation-link",
            },
            "Docs",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "action" },
          React.createElement(
            NavigationMenuLink,
            {
              asChild: true,
              href: "/ignored",
              onSelect: () => {},
            },
            React.createElement("button", { type: "button" }, "Action"),
          ),
        ),
      ),
      React.createElement(
        NavigationMenuIndicator,
        {
          className: "navigation-indicator-class",
          "data-testid": "navigation-indicator",
        },
        React.createElement("span", null, "indicator"),
      ),
      React.createElement(NavigationMenuViewport, {
        className: "navigation-viewport-class",
        "data-testid": "navigation-viewport",
      }),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /id="main-navigation"/);
  assert.match(html, /style="color:blue"/);
  assert.match(html, /data-testid="navigation-root"/);
  assert.match(html, /data-slot="navigation-menu"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /class="navigation-root-class"/);
  assert.match(html, /role="list"/);
  assert.match(html, /data-testid="navigation-list"/);
  assert.match(html, /data-slot="navigation-menu-list"/);
  assert.match(html, /class="navigation-list-class"/);
  assert.match(html, /data-slot="navigation-menu-item"/);
  assert.match(html, /title="Products item"/);
  assert.match(html, /class="navigation-item-class"/);
  assert.match(html, /data-slot="navigation-menu-trigger"/);
  assert.match(html, /data-testid="navigation-trigger"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /class="navigation-trigger-class"/);
  assert.match(html, /data-slot="navigation-menu-link"/);
  assert.match(html, /href="\/docs"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noreferrer"/);
  assert.match(html, /data-testid="navigation-link"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /class="navigation-link-class"/);
  assert.match(html, /<button type="button" data-slot="navigation-menu-link">Action<\/button>/);
  assert.doesNotMatch(html, /<button[^>]+href="\/ignored"/);
  assert.match(html, /data-slot="navigation-menu-indicator"/);
  assert.match(html, /data-state="visible"/);
  assert.match(html, /data-testid="navigation-indicator"/);
  assert.match(html, /class="navigation-indicator-class"/);
  assert.match(html, /<span>indicator<\/span>/);
  assert.match(html, /data-slot="navigation-menu-viewport"/);
  assert.match(html, /data-testid="navigation-viewport"/);
  assert.match(html, /class="navigation-viewport-class"/);
  assert.match(html, /data-slot="navigation-menu-content"/);
  assert.match(html, /data-testid="navigation-content"/);
  assert.match(html, /data-motion="from-end"/);
  assert.match(html, /class="navigation-content-class"/);
  assert.match(html, /Product panel/);
});

test("NavigationMenu primitives allow custom data-slot overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        "data-slot": "custom-navigation-root",
      },
      React.createElement(
        NavigationMenuList,
        { "data-slot": "custom-navigation-list" },
        React.createElement(
          NavigationMenuItem,
          { value: "products", "data-slot": "custom-navigation-item" },
          React.createElement(
            NavigationMenuTrigger,
            { "data-slot": "custom-navigation-trigger" },
            "Products",
          ),
          React.createElement(
            NavigationMenuContent,
            { "data-slot": "custom-navigation-content" },
            "Product panel",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "docs" },
          React.createElement(
            NavigationMenuLink,
            {
              href: "/docs",
              "data-slot": "custom-navigation-link",
            },
            "Docs",
          ),
        ),
      ),
      React.createElement(NavigationMenuIndicator, {
        "data-slot": "custom-navigation-indicator",
      }),
      React.createElement(NavigationMenuViewport, {
        "data-slot": "custom-navigation-viewport",
      }),
    ),
  );

  assert.match(html, /data-slot="custom-navigation-root"/);
  assert.match(html, /data-slot="custom-navigation-list"/);
  assert.match(html, /data-slot="custom-navigation-item"/);
  assert.match(html, /data-slot="custom-navigation-trigger"/);
  assert.match(html, /data-slot="custom-navigation-content"/);
  assert.match(html, /data-slot="custom-navigation-link"/);
  assert.match(html, /data-slot="custom-navigation-indicator"/);
  assert.match(html, /data-slot="custom-navigation-viewport"/);
});

test("NavigationMenu primitives support custom render elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        render: "header",
      },
      React.createElement(
        NavigationMenuList,
        { render: "ol" },
        React.createElement(
          NavigationMenuItem,
          { value: "products", render: "div" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(
            NavigationMenuContent,
            { render: "section" },
            "Product panel",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "docs" },
          React.createElement(
            NavigationMenuLink,
            { href: "/docs", render: "button" },
            "Docs",
          ),
        ),
      ),
      React.createElement(NavigationMenuViewport, { render: "aside" }),
    ),
  );

  assert.match(html, /^<header/);
  assert.match(html, /<ol role="list" data-slot="navigation-menu-list"/);
  assert.match(html, /<div data-slot="navigation-menu-item"/);
  assert.match(html, /<section[^>]+data-slot="navigation-menu-content"/);
  assert.match(html, /<button[^>]+data-slot="navigation-menu-link"/);
  assert.match(html, /<aside[^>]+data-slot="navigation-menu-viewport"/);
});

test("NavigationMenu primitives support asChild element overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        asChild: true,
      },
      React.createElement(
        "section",
        { "data-root-child": "true" },
        React.createElement(
          NavigationMenuList,
          { asChild: true },
          React.createElement(
            "ol",
            { "data-list-child": "true" },
            React.createElement(
              NavigationMenuItem,
              { value: "products", asChild: true },
              React.createElement(
                "div",
                { "data-item-child": "true" },
                React.createElement(NavigationMenuTrigger, null, "Products"),
                React.createElement(
                  NavigationMenuContent,
                  { asChild: true },
                  React.createElement(
                    "section",
                    { "data-content-child": "true" },
                    "Product panel",
                  ),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          NavigationMenuViewport,
          { asChild: true },
          React.createElement("aside", { "data-viewport-child": "true" }),
        ),
      ),
    ),
  );

  assert.match(html, /^<section data-root-child="true" data-slot="navigation-menu"/);
  assert.match(html, /<ol data-list-child="true" role="list" data-slot="navigation-menu-list"/);
  assert.match(html, /<div data-item-child="true" data-slot="navigation-menu-item"/);
  assert.match(html, /<section data-content-child="true"[^>]+data-slot="navigation-menu-content"/);
  assert.match(html, /<aside data-viewport-child="true"[^>]+data-slot="navigation-menu-viewport"/);
  assert.match(html, /Product panel/);
});

test("NavigationMenu asChild parts preserve slotted children", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      { defaultValue: "products" },
      React.createElement(
        NavigationMenuList,
        null,
        React.createElement(
          NavigationMenuItem,
          { value: "products" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(
            NavigationMenuContent,
            null,
            React.createElement(
              NavigationMenuSub,
              { asChild: true, defaultValue: "nested" },
              React.createElement(
                "section",
                { "data-sub-child": "true" },
                React.createElement(
                  NavigationMenuList,
                  null,
                  React.createElement(
                    NavigationMenuItem,
                    { value: "nested" },
                    React.createElement(NavigationMenuTrigger, null, "Nested"),
                    React.createElement(NavigationMenuContent, null, "Nested panel"),
                  ),
                ),
                React.createElement(NavigationMenuViewport, null),
              ),
            ),
          ),
        ),
      ),
      React.createElement(
        NavigationMenuIndicator,
        { asChild: true },
        React.createElement(
          "span",
          { "data-indicator-child": "true" },
          React.createElement("i", { "data-arrow-child": "true" }),
        ),
      ),
      React.createElement(NavigationMenuViewport, null),
    ),
  );

  assert.match(html, /<span data-indicator-child="true"[^>]+data-slot="navigation-menu-indicator"[^>]*><i data-arrow-child="true"><\/i><\/span>/);
  assert.doesNotMatch(html, /data-indicator-child="true"[^>]*><span data-indicator-child="true"/);
  assert.match(html, /<section data-sub-child="true"[^>]+data-slot="navigation-menu-sub"/);
  assert.doesNotMatch(html, /data-sub-child="true"[^>]*><section data-sub-child="true"/);
  assert.match(html, /Nested panel/);
});

test("NavigationMenu exposes trigger geometry helpers for indicator and viewport CSS variables", () => {
  const geometry = getNavigationMenuGeometry({
    rootRect: { left: 100, top: 50, width: 600, height: 80 },
    triggerRect: { left: 220, top: 70, width: 90, height: 32 },
  });

  assert.deepEqual(geometry, {
    left: 120,
    top: 20,
    width: 90,
    height: 32,
    centerX: 165,
    centerY: 36,
  });

  assert.deepEqual(getNavigationMenuGeometryStyle(geometry), {
    "--atom-navigation-menu-trigger-left": "120px",
    "--atom-navigation-menu-trigger-top": "20px",
    "--atom-navigation-menu-trigger-width": "90px",
    "--atom-navigation-menu-trigger-height": "32px",
    "--atom-navigation-menu-trigger-center-x": "165px",
    "--atom-navigation-menu-trigger-center-y": "36px",
  });

  assert.deepEqual(getNavigationMenuViewportSizeStyle(320, 180), {
    "--atom-navigation-menu-viewport-width": "320px",
    "--atom-navigation-menu-viewport-height": "180px",
  });

  const centeredPosition = getNavigationMenuViewportPosition({
    rootRect: { left: 100, top: 50, width: 600, height: 80 },
    triggerRect: { left: 220, top: 70, width: 90, height: 32 },
    viewportWidth: 320,
    boundaryRect: { left: 0, width: 1000 },
  });

  assert.deepEqual(centeredPosition, {
    left: 5,
    availableWidth: 984,
  });
  assert.deepEqual(getNavigationMenuViewportPositionStyle(centeredPosition), {
    "--atom-navigation-menu-viewport-left": "5px",
    "--atom-navigation-menu-viewport-available-width": "984px",
  });
});

test("NavigationMenu viewport positioning clamps narrow and oversized panels to the visible boundary", () => {
  assert.deepEqual(
    getNavigationMenuViewportPosition({
      rootRect: { left: 0, top: 0, width: 360, height: 48 },
      triggerRect: { left: 0, top: 0, width: 80, height: 48 },
      viewportWidth: 320,
      boundaryRect: { left: 0, width: 390 },
    }),
    { left: 8, availableWidth: 374 },
  );

  assert.deepEqual(
    getNavigationMenuViewportPosition({
      rootRect: { left: 200, top: 0, width: 500, height: 48 },
      triggerRect: { left: 650, top: 0, width: 50, height: 48 },
      viewportWidth: 320,
      boundaryRect: { left: 0, width: 700 },
    }),
    { left: 172, availableWidth: 684 },
  );

  assert.deepEqual(
    getNavigationMenuViewportPosition({
      rootRect: { left: 40, top: 0, width: 310, height: 48 },
      triggerRect: { left: 160, top: 0, width: 70, height: 48 },
      viewportWidth: 800,
      boundaryRect: { left: 0, width: 390 },
    }),
    { left: -32, availableWidth: 374 },
  );
});

test("NavigationMenuSub creates a nested navigation menu scope", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      { defaultValue: "products" },
      React.createElement(
        NavigationMenuList,
        null,
        React.createElement(
          NavigationMenuItem,
          { value: "products" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(
            NavigationMenuContent,
            null,
            React.createElement(
              NavigationMenuSub,
              { defaultValue: "templates", className: "navigation-sub-class" },
              React.createElement(
                NavigationMenuList,
                null,
                React.createElement(
                  NavigationMenuItem,
                  { value: "templates" },
                  React.createElement(NavigationMenuTrigger, null, "Templates"),
                  React.createElement(
                    NavigationMenuContent,
                    null,
                    "Template panel",
                  ),
                ),
              ),
              React.createElement(NavigationMenuViewport, null),
            ),
          ),
        ),
      ),
      React.createElement(NavigationMenuViewport, null),
    ),
  );

  assert.match(html, /data-slot="navigation-menu-sub"/);
  assert.match(html, /class="navigation-sub-class"/);
  assert.match(html, /data-slot="navigation-menu-viewport"/);
  assert.match(html, /Template panel/);
});

test("NavigationMenuRoot supports local and provider direction", () => {
  const localHtml = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      { dir: "rtl" },
      React.createElement(NavigationMenuList, null),
    ),
  );
  const providerHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(
        NavigationMenuRoot,
        null,
        React.createElement(NavigationMenuList, null),
      ),
    ),
  );

  assert.match(localHtml, /dir="rtl"/);
  assert.match(providerHtml, /dir="rtl"/);
});

test("NavigationMenu trigger keeps aria-controls stable when closed", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      null,
      React.createElement(
        NavigationMenuList,
        null,
        React.createElement(
          NavigationMenuItem,
          { value: "products" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(NavigationMenuContent, null, "Product panel"),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="navigation-menu-trigger"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="[^"]+"/);
});

test("NavigationMenu source keeps context and registration stable", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuRoot.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuItem.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuTrigger.tsx", packageRoot),
    "utf8",
  );
  const linkSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuLink.tsx", packageRoot),
    "utf8",
  );
  const subSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuSub.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuContent.tsx", packageRoot),
    "utf8",
  );
  const viewportSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuViewport.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const contextValue: NavigationMenuContextValue = useMemo/);
  assert.match(rootSource, /const contextDir = useDirection\(\)/);
  assert.match(rootSource, /const dir = dirProp \?\? contextDir/);
  assert.match(rootSource, /loop = true/);
  assert.match(rootSource, /loop,/);
  assert.match(rootSource, /useCollection<string, HTMLElement, \{ type: NavigationMenuControlType \}>\(\)/);
  assert.match(rootSource, /registerControlItem\(value, element, \{ data: \{ type: "trigger" \} \}\)/);
  assert.match(rootSource, /registerControlItem\(value, element, \{ data: \{ type: "link" \} \}\)/);
  assert.match(rootSource, /getControlItem\(value\)\?\.element \?\? null/);
  assert.match(rootSource, /getControlItem\(value\)\?\.data\.type \?\? null/);
  assert.match(rootSource, /getNextControlItem\(value, direction, \{ loop \}\)\?\.value \?\? null/);
  assert.match(rootSource, /getFirstControlItem\(\)\?\.value \?\? null/);
  assert.match(rootSource, /getLastControlItem\(\)\?\.value \?\? null/);
  assert.match(rootSource, /useOutsideInteraction\(/);
  assert.match(rootSource, /entry\?\.onFocusOutside\?\.\(notification\)/);
  assert.doesNotMatch(rootSource, /triggerRegistryRef/);
  assert.doesNotMatch(rootSource, /itemValuesRef/);
  assert.match(subSource, /NavigationMenuRoot/);
  assert.match(subSource, /loop=\{parent.loop\}/);
  assert.match(subSource, /disableHoverTrigger=\{parent.disableHoverTrigger\}/);
  assert.doesNotMatch(subSource, /onBlur: composeEventHandlers\(onBlur, handleBlur\),\s*children,\s*\}/);
  assert.doesNotMatch(subSource, /triggerRegistryRef/);
  assert.doesNotMatch(subSource, /itemValuesRef/);
  assert.match(rootSource, /\}, resolvedCloseDelay\)/);
  assert.match(rootSource, /\[resolvedCloseDelay, disablePointerLeaveClose, handleValueChange\]/);
  assert.match(itemSource, /const \{ registerItem, unregisterItem \} = ctx/);
  assert.match(itemSource, /\}, \[registerItem, unregisterItem, value\]\)/);
  assert.match(triggerSource, /registerTrigger,/);
  assert.match(triggerSource, /unregisterTrigger,/);
  assert.match(triggerSource, /value: activeValue,/);
  assert.match(triggerSource, /pointerOpenedRef\.current = true/);
  assert.match(triggerSource, /isOpen && pointerOpenedRef\.current/);
  assert.match(triggerSource, /\}, \[disabled, registerTrigger, unregisterTrigger, value\]\)/);
  assert.match(triggerSource, /const focusTrigger = useCallback/);
  assert.match(triggerSource, /control\.focus\(\{ preventScroll: true \}\)/);
  assert.match(triggerSource, /onValueChange\(getControlType\(nextValue\) === "trigger" \? nextValue : null\)/);
  assert.match(triggerSource, /if \(orientation === "vertical"\) \{/);
  assert.match(triggerSource, /else if \(dir === "ltr"\)/);
  assert.match(triggerSource, /else if \(dir === "rtl"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, dir === "rtl" \? "previous" : "next"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, dir === "rtl" \? "next" : "previous"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, "next"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, "previous"\)/);
  assert.match(triggerSource, /focusTrigger\(getFirstTriggerValue\(\)\)/);
  assert.match(triggerSource, /focusTrigger\(getLastTriggerValue\(\)\)/);
  assert.match(triggerSource, /case "Escape": \{/);
  assert.match(triggerSource, /"aria-controls": contentId/);
  assert.doesNotMatch(triggerSource, /\},\s*\[ctx\]/);
  assert.match(linkSource, /useOptionalNavigationMenuItemContext\(\)/);
  assert.match(linkSource, /registerLink\(value, element\)/);
  assert.match(linkSource, /unregisterLink\(value\)/);
  assert.match(linkSource, /const focusControl = useCallback/);
  assert.match(linkSource, /focusControl\(getNextTriggerValue\(value, dir === "rtl" \? "previous" : "next"\)\)/);
  assert.match(linkSource, /focusControl\(getNextTriggerValue\(value, "next"\)\)/);
  assert.match(linkSource, /onValueChange\(null\)/);
  assert.match(contentSource, /const \{ registerContentNode, unregisterContentNode \} = ctx/);
  assert.match(contentSource, /dataSlot,/);
  assert.match(contentSource, /loop,/);
  assert.match(contentSource, /props: restProps/);
  assert.match(contentSource, /render,/);
  assert.match(contentSource, /asChild,/);
  assert.match(viewportSource, /NavigationMenuPanel/);
  assert.match(viewportSource, /getNavigationMenuGeometryStyle\(/);
  assert.match(viewportSource, /getNavigationMenuViewportPositionStyle\(/);
  assert.match(viewportSource, /collisionPadding = 8/);
  assert.match(viewportSource, /view\?\.visualViewport\?\.addEventListener\("resize", measure\)/);
  assert.match(viewportSource, /view\?\.visualViewport\?\.addEventListener\("scroll", measure\)/);
  assert.match(viewportSource, /const root = rootRef\.current/);
  assert.doesNotMatch(viewportSource, /parentElement \?\? rootRef\.current/);
  assert.match(viewportSource, /const rootRect = root\.getBoundingClientRect\(\)/);
  assert.match(viewportSource, /const triggerRect = trigger\.getBoundingClientRect\(\)/);
  assert.match(viewportSource, /if \(root\) resizeObserver\?\.observe\(root\)/);
  assert.match(viewportSource, /if \(trigger\) resizeObserver\?\.observe\(trigger\)/);
  assert.match(viewportSource, /const contentLoop = activeEntry\?\.loop \?\? loop/);
  assert.match(viewportSource, /getContentValues\(\)\.map/);
  assert.match(viewportSource, /const handleContentKeyDown = useCallback/);
  assert.match(viewportSource, /const getOrderedTarget = \(direction: "next" \| "previous"\) => \{/);
  assert.match(viewportSource, /if \(!contentLoop\) return null/);
  assert.match(viewportSource, /activeContent\.querySelectorAll<HTMLElement>\(FOCUSABLE_SELECTOR\)/);
  assert.match(viewportSource, /case "Tab": \{/);
  assert.match(viewportSource, /getNextTriggerValue\(value, "next"\)/);
  assert.match(viewportSource, /nextControl\.focus\(\{ preventScroll: true \}\)/);
  assert.match(viewportSource, /case "Escape": \{/);
  assert.match(viewportSource, /event\.nativeEvent\.stopImmediatePropagation\(\)/);
  assert.match(viewportSource, /trigger\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(viewportSource, /case "ArrowDown": \{/);
  assert.match(viewportSource, /getOrderedTarget\("next"\)/);
  assert.match(viewportSource, /getOrderedTarget\("previous"\)/);
  assert.match(viewportSource, /case "Home": \{/);
  assert.match(contentSource, /\}, \[unregisterContentNode, value\]\)/);
  assert.doesNotMatch(
    await readFile(
      new URL("src/primitives/navigation-menu/NavigationMenuIndicator.tsx", packageRoot),
      "utf8",
    ),
    /style: indicatorStyle,\s*children,\s*\}/,
  );
  assert.doesNotMatch(itemSource, /\}, \[ctx, value\]\)/);
  assert.doesNotMatch(triggerSource, /ctx\.registerTrigger\(value, el\)/);
  assert.doesNotMatch(triggerSource, /ctx\.unregisterTrigger\(value\)/);
  assert.doesNotMatch(contentSource, /\}, \[ctx, value\]\)/);
}
);
