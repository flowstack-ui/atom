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
