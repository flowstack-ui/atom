import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  AppBar,
  AppBarCenter,
  AppBarEnd,
  AppBarRoot,
  AppBarStart,
  AppBarToolbar,
  Toolbar,
} from "../../dist/index.js";

test("AppBar compound parts render semantic header anatomy without toolbar role", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AppBar.Root,
      { position: "sticky", "aria-label": "Application header" },
      React.createElement(
        AppBar.Toolbar,
        { density: "compact" },
        React.createElement(AppBar.Start, null, "Brand"),
        React.createElement(AppBar.Center, null, "Primary nav"),
        React.createElement(AppBar.End, null, "Actions"),
      ),
    ),
  );

  assert.match(html, /^<header/);
  assert.match(html, /data-slot="appbar"/);
  assert.match(html, /data-position="sticky"/);
  assert.match(html, /aria-label="Application header"/);
  assert.match(html, /data-slot="appbar-toolbar"/);
  assert.match(html, /data-density="compact"/);
  assert.match(html, /data-slot="appbar-start"/);
  assert.match(html, /data-slot="appbar-center"/);
  assert.match(html, /data-slot="appbar-end"/);
  assert.doesNotMatch(html, /role="toolbar"/);
  assert.equal(AppBar.Root, AppBarRoot);
  assert.equal(AppBar.Toolbar, AppBarToolbar);
  assert.equal(AppBar.Start, AppBarStart);
  assert.equal(AppBar.Center, AppBarCenter);
  assert.equal(AppBar.End, AppBarEnd);
});

test("AppBar parts support asChild and render overrides", () => {
  const rootHtml = renderToStaticMarkup(
    React.createElement(
      AppBarRoot,
      { asChild: true, position: "absolute" },
      React.createElement("section", null, "Custom shell"),
    ),
  );
  const toolbarHtml = renderToStaticMarkup(
    React.createElement(
      AppBarToolbar,
      { render: "nav", density: "comfortable", "aria-label": "Main" },
      "Links",
    ),
  );

  assert.match(rootHtml, /^<section/);
  assert.match(rootHtml, /data-slot="appbar"/);
  assert.match(rootHtml, /data-position="absolute"/);
  assert.match(toolbarHtml, /^<nav/);
  assert.match(toolbarHtml, /data-slot="appbar-toolbar"/);
  assert.match(toolbarHtml, /data-density="comfortable"/);
  assert.match(toolbarHtml, /aria-label="Main"/);
});

test("AppBar barrels do not create a client boundary", async () => {
  const primitiveIndexSource = await readFile(
    new URL("src/primitives/app-bar/index.ts", packageRoot),
    "utf8",
  );
  const subpathSource = await readFile(
    new URL("src/app-bar.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(primitiveIndexSource, /^"use client";/);
  assert.doesNotMatch(subpathSource, /^"use client";/);
});
