import {
  assert,
  readFile,
  path,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  List,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbRoot,
  BreadcrumbSeparator,
} from "../../dist/index.js";

test("Breadcrumb compound parts render landmark, ordered list, current page, and hidden separators", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Breadcrumb.Root,
      { ariaLabel: "Path" },
      React.createElement(
        Breadcrumb.List,
        null,
        React.createElement(
          Breadcrumb.Item,
          null,
          React.createElement(Breadcrumb.Link, { href: "/" }, "Home"),
        ),
        React.createElement(Breadcrumb.Separator, null),
        React.createElement(
          Breadcrumb.Item,
          null,
          React.createElement(Breadcrumb.Ellipsis, null),
        ),
        React.createElement(Breadcrumb.Separator, { "data-testid": "separator" }, ">"),
        React.createElement(
          Breadcrumb.Item,
          null,
          React.createElement(Breadcrumb.Page, { title: "Current page" }, "Docs"),
        ),
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /aria-label="Path"/);
  assert.match(html, /data-slot="breadcrumb"/);
  assert.match(html, /<ol data-slot="breadcrumb-list"/);
  assert.match(html, /<li data-slot="breadcrumb-item"><a href="\/" data-slot="breadcrumb-link">Home<\/a><\/li>/);
  assert.match(html, /role="presentation" aria-hidden="true" data-slot="breadcrumb-separator"/);
  assert.match(html, /<span data-slot="breadcrumb-ellipsis">…<\/span>/);
  assert.doesNotMatch(html, /data-slot="breadcrumb-ellipsis"[^>]+aria-hidden/);
  assert.match(html, /data-testid="separator"/);
  assert.match(html, /title="Current page"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-slot="breadcrumb-page"/);
  assert.doesNotMatch(html, /data-slot="breadcrumb-page"[^>]+role="link"/);
  assert.doesNotMatch(html, /data-slot="breadcrumb-page"[^>]+aria-disabled/);
  assert.equal(Breadcrumb.Root, BreadcrumbRoot);
  assert.equal(Breadcrumb.List, BreadcrumbList);
  assert.equal(Breadcrumb.Item, BreadcrumbItem);
  assert.equal(Breadcrumb.Link, BreadcrumbLink);
  assert.equal(Breadcrumb.Page, BreadcrumbPage);
  assert.equal(Breadcrumb.Separator, BreadcrumbSeparator);
  assert.equal(Breadcrumb.Ellipsis, BreadcrumbEllipsis);
});

test("BreadcrumbEllipsis supports accessible collapsed crumb triggers", () => {
  const labelledHtml = renderToStaticMarkup(
    React.createElement(Breadcrumb.Ellipsis, { "aria-label": "3 collapsed pages" }),
  );
  const triggerHtml = renderToStaticMarkup(
    React.createElement(
      Breadcrumb.Ellipsis,
      { asChild: true },
      React.createElement("button", { type: "button", "aria-label": "Show path" }, "…"),
    ),
  );

  assert.match(labelledHtml, /aria-label="3 collapsed pages"/);
  assert.doesNotMatch(labelledHtml, /aria-hidden=/);
  assert.match(triggerHtml, /^<button/);
  assert.match(triggerHtml, /aria-label="Show path"/);
  assert.match(triggerHtml, /data-slot="breadcrumb-ellipsis"/);
  assert.doesNotMatch(triggerHtml, /aria-hidden=/);
  assert.doesNotMatch(triggerHtml, /role="presentation"/);
});

test("Breadcrumb primitive barrel does not create a client boundary", async () => {
  const indexSource = await readFile(
    new URL("src/primitives/breadcrumb/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(indexSource, /^"use client";/);
});


test("Breadcrumb naming preserves native, legacy, referenced and composed labels", () => {
  const cases = [
    [{}, "Breadcrumb"],
    [{ "aria-label": "Native" }, "Native"],
    [{ ariaLabel: "Legacy" }, "Legacy"],
    [{ "aria-label": "Native", ariaLabel: "Legacy" }, "Native"],
    [{ "aria-label": "" }, ""],
  ];
  for (const [props, label] of cases) {
    const html = renderToStaticMarkup(React.createElement(Breadcrumb.Root, props));
    assert.match(html, new RegExp(`aria-label="${label}"`));
    assert.doesNotMatch(html, /ariaLabel=/);
  }
  for (const props of [
    { "aria-labelledby": "heading" },
    { asChild: true, children: React.createElement("nav", { "aria-labelledby": "heading" }) },
    { render: React.createElement("nav", { "aria-labelledby": "heading" }) },
    { render: props => React.createElement("nav", { ...props, "aria-labelledby": "heading" }) },
  ]) {
    const html = renderToStaticMarkup(React.createElement(Breadcrumb.Root, props));
    assert.match(html, /aria-labelledby="heading"/);
    assert.doesNotMatch(html, /aria-label=/);
  }
  for (const mode of ["asChild", "render"]) {
    const child = React.createElement("nav", { "aria-label": "Child", className: "child" });
    const props = mode === "asChild" ? { asChild: true, children: child } : { render: child };
    assert.match(renderToStaticMarkup(React.createElement(Breadcrumb.Root, props)), /aria-label="Child"/);
    const overridden = renderToStaticMarkup(React.createElement(Breadcrumb.Root, { ...props, "aria-label": "Parent", className: "parent" }));
    assert.match(overridden, /aria-label="Parent"/);
    assert.match(overridden, /class="child parent"/);
  }
});

test("Breadcrumb Page composes a real current destination without an artificial link role", () => {
  const html = renderToStaticMarkup(React.createElement(Breadcrumb.Page, { asChild: true },
    React.createElement("a", { href: "/current", "aria-current": "false" }, "Current")));
  assert.match(html, /^<a /);
  assert.match(html, /href="\/current"/);
  assert.match(html, /aria-current="page"/);
  assert.doesNotMatch(html, /role=|aria-disabled=/);
});
