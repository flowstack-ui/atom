import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

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
  assert.match(html, /href="\/home"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-state="active"/);
  assert.match(html, /data-active=""/);
  assert.match(html, /data-label-visible=""/);
  assert.match(html, /href="\/search"/);
  assert.match(html, /data-state="inactive"/);
});

test("BottomNavigationItem renders a button when href is omitted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BottomNavigationRoot,
      { defaultValue: "home", "aria-label": "Primary destinations" },
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
      { asChild: true, defaultValue: "home", className: "root-class" },
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
