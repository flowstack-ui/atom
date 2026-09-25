import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationRoot,
} from "../../dist/index.js";

test("BottomNavigation primitives render route navigation semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home", showLabels: false },
      React.createElement(BottomNavigationItem, { value: "home", href: "/home" }, "Home"),
      React.createElement(BottomNavigationItem, { value: "search", href: "/search" }, "Search"),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /data-slot="bottom-nav-root"/);
  assert.match(html, /aria-label="Bottom navigation"/);
  assert.match(html, /data-label-visibility="active"/);
  assert.match(html, /data-position="static"/);
  assert.match(html, /href="\/home"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-state="active"/);
  assert.match(html, /data-active=""/);
  assert.match(html, /data-label-visible=""/);
  assert.match(html, /href="\/search"/);
  assert.match(html, /data-state="inactive"/);
});

test("BottomNavigation label visibility policies expose stable Root and Item data", () => {
  const render = (labelVisibility, showLabels) => renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home", labelVisibility, showLabels },
      React.createElement(BottomNavigationItem, { value: "home" }, "Home"),
      React.createElement(BottomNavigationItem, { value: "search" }, "Search"),
    ),
  );

  const always = render("always");
  assert.match(always, /data-label-visibility="always"/);
  assert.equal((always.match(/data-label-visible=""/g) ?? []).length, 2);

  const active = render("active");
  assert.match(active, /data-label-visibility="active"/);
  assert.equal((active.match(/data-label-visible=""/g) ?? []).length, 1);

  const hidden = render("hidden");
  assert.match(hidden, /data-label-visibility="hidden"/);
  assert.doesNotMatch(hidden, /data-label-visible=""/);

  const legacyTrue = render(undefined, true);
  assert.match(legacyTrue, /data-label-visibility="always"/);
  assert.equal((legacyTrue.match(/data-label-visible=""/g) ?? []).length, 2);

  const legacyFalse = render(undefined, false);
  assert.match(legacyFalse, /data-label-visibility="active"/);
  assert.equal((legacyFalse.match(/data-label-visible=""/g) ?? []).length, 1);

  const precedence = render("hidden", true);
  assert.match(precedence, /data-label-visibility="hidden"/);
  assert.doesNotMatch(precedence, /data-label-visible=""/);
});

test("BottomNavigation exposes every positioning intent", () => {
  for (const position of ["static", "sticky", "absolute", "fixed"]) {
    const html = renderToStaticMarkup(
      React.createElement(
        BottomNavigationRoot,
        { position },
        React.createElement(BottomNavigationItem, { value: "home" }, "Home"),
      ),
    );
    assert.match(html, new RegExp(`data-position="${position}"`));
  }
});

test("BottomNavigationItem renders a button when href is omitted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home", ariaLabel: "Primary destinations" },
      React.createElement(
        BottomNavigationItem,
        { value: "home", "aria-label": "Home destination" },
        "Home",
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /aria-label="Primary destinations"/);
  assert.match(html, /<button/);
  assert.match(html, /aria-label="Home destination"/);
  assert.match(html, /type="button"/);
  assert.match(html, /data-slot="bottom-nav-item"/);
  assert.match(html, /data-value="home"/);
});

test("BottomNavigationItem exposes disabled destination state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home" },
      React.createElement(
        BottomNavigationItem,
        { value: "settings", href: "/settings", disabled: true },
        "Settings",
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.doesNotMatch(html, /href="\/settings"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-state="inactive"/);
});

test("BottomNavigation primitives support asChild element merging", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { asChild: true, defaultValue: "home", className: "root-class", labelVisibility: "hidden", position: "fixed" },
      React.createElement(
        "section",
        { className: "section-class" },
        React.createElement(
          BottomNavigationItem,
          { asChild: true, value: "home", className: "item-class" },
          React.createElement("a", { className: "anchor-class", href: "/home" }, "Home"),
        ),
      ),
    ),
  );

  assert.match(html, /^<section/);
  assert.match(html, /data-slot="bottom-nav-root"/);
  assert.match(html, /data-label-visibility="hidden"/);
  assert.match(html, /data-position="fixed"/);
  assert.match(html, /class="section-class root-class"/);
  assert.match(html, /<a/);
  assert.match(html, /data-slot="bottom-nav-item"/);
  assert.match(html, /class="anchor-class item-class"/);
  assert.match(html, /aria-current="page"/);
});

test("BottomNavigationItem asChild omits native button-only props", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home" },
      React.createElement(
        BottomNavigationItem,
        { asChild: true, value: "home" },
        React.createElement("div", null, "Home"),
      ),
    ),
  );

  assert.match(html, /<div/);
  assert.match(html, /data-slot="bottom-nav-item"/);
  assert.doesNotMatch(html, /type="button"/);
});

test("BottomNavigation namespace exposes Root and Item parts", () => {
  assert.equal(BottomNavigation.Root, BottomNavigationRoot);
  assert.equal(BottomNavigation.Item, BottomNavigationItem);
});

test("BottomNavigation preserves native and composed landmark naming", () => {
  const child = React.createElement(BottomNavigationItem, { value: "home" }, "Home");
  for (const props of [{ "aria-label": "Primary", ariaLabel: "Alias" }, { asChild: true }]) {
    const html = renderToStaticMarkup(React.createElement(BottomNavigationRoot, props,
      props.asChild ? React.createElement("nav", { "aria-label": "Primary" }, child) : child));
    assert.match(html, /aria-label="Primary"/);
  }
  const html = renderToStaticMarkup(React.createElement(BottomNavigationRoot,
    { "aria-labelledby": "navigation-heading", ariaLabel: "Alias" }, child));
  assert.match(html, /aria-labelledby="navigation-heading"/);
  assert.doesNotMatch(html, /aria-label=/);
});

test("BottomNavigation normalizes native hosts after composition", () => {
  for (const mode of ["asChild", "render"]) {
    for (const tag of ["a", "button"]) {
      const element = React.createElement(tag, tag === "a" ? { href: "/private" } : {}, "Destination");
      const props = { value: "destination", disabled: true,
        ...(mode === "asChild" ? { asChild: true } : { render: element }) };
      const html = renderToStaticMarkup(React.createElement(BottomNavigationRoot, null,
        React.createElement(BottomNavigationItem, props, mode === "asChild" ? element : "Destination")));
      assert.doesNotMatch(html, /href=/);
      assert.match(html, /aria-disabled="true"/);
      if (tag === "button") {
        assert.match(html, /type="button"/);
        assert.match(html, / disabled=""/);
      }
    }
  }
  const html = renderToStaticMarkup(React.createElement(BottomNavigationRoot, null,
    React.createElement(BottomNavigationItem, { value: "submit", render: React.createElement("button", { type: "submit" }) }, "Submit")));
  assert.match(html, /type="submit"/);
});

test("BottomNavigation preserves native link activation, cancellation and composed refs", async () => {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://example.test/" });
  const saved = new Map();
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
    navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const root = createRoot(document.getElementById("root"));
  const ref = React.createRef();
  let calls = 0;
  try {
    const mount = async (childProps = {}, itemProps = {}) => {
      await React.act(async () => root.render(React.createElement(BottomNavigationRoot, { onChange: () => calls++ },
        React.createElement(BottomNavigationItem, { asChild: true, value: "home", ref, ...itemProps },
          React.createElement("a", { href: "#home", ...childProps }, "Home")))));
      return document.querySelector("a");
    };
    const click = async (node, options = {}) => {
      const event = new dom.window.MouseEvent("click", { bubbles: true, cancelable: true, ...options });
      await React.act(async () => node.dispatchEvent(event));
    };
    let link = await mount();
    assert.equal(ref.current, link);
    for (const flag of ["ctrlKey", "metaKey", "shiftKey", "altKey"]) await click(link, { [flag]: true });
    assert.equal(calls, 0);
    link = await mount({ target: "_blank" }); await click(link); assert.equal(calls, 0);
    link = await mount({ download: "report" }); await click(link); assert.equal(calls, 0);
    link = await mount({ onClick: event => event.preventDefault() }); await click(link); assert.equal(calls, 0);
    link = await mount({}, { disabled: true }); await click(link); assert.equal(calls, 0);
    assert.equal(link.hasAttribute("href"), false);
    link = await mount(); await click(link); assert.equal(calls, 1);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
});
