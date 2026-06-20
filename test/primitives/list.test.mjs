import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  List,
  ListItem,
  ListRoot,
} from "../../dist/index.js";

test("List compound parts render native list anatomy", () => {
  const unorderedHtml = renderToStaticMarkup(
    React.createElement(
      List.Root,
      {
        title: "Settings",
        "data-testid": "settings-list",
      },
      React.createElement(List.Item, null, "Profile"),
      React.createElement(List.Item, { disabled: true }, "Billing"),
    ),
  );
  const orderedHtml = renderToStaticMarkup(
    React.createElement(
      ListRoot,
      { ordered: true, start: 3, reversed: true },
      React.createElement(ListItem, null, "First"),
    ),
  );

  assert.match(unorderedHtml, /^<ul/);
  assert.match(unorderedHtml, /title="Settings"/);
  assert.match(unorderedHtml, /data-testid="settings-list"/);
  assert.match(unorderedHtml, /data-slot="list"/);
  assert.match(unorderedHtml, /<li data-slot="list-item">Profile<\/li>/);
  assert.match(unorderedHtml, /<li data-slot="list-item" aria-disabled="true" data-disabled="">Billing<\/li>/);
  assert.match(orderedHtml, /^<ol/);
  assert.match(orderedHtml, /start="3"/);
  assert.match(orderedHtml, /reversed=""/);
  assert.match(orderedHtml, /data-ordered=""/);
  assert.equal(List.Root, ListRoot);
  assert.equal(List.Item, ListItem);
});

test("List parts support slot overrides and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ListRoot,
      { render: "ol", "data-slot": "custom-list" },
      React.createElement(
        ListItem,
        {
          render: React.createElement("li", { className: "consumer-item" }),
          "data-slot": "custom-item",
        },
        "One",
      ),
    ),
  );

  assert.match(html, /^<ol/);
  assert.match(html, /data-slot="custom-list"/);
  assert.match(html, /class="consumer-item"/);
  assert.match(html, /data-slot="custom-item"/);
});

test("List barrels do not create a client boundary", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/list/ListRoot.tsx", packageRoot),
    "utf8",
  );
  const primitiveIndexSource = await readFile(
    new URL("src/primitives/list/index.ts", packageRoot),
    "utf8",
  );
  const subpathSource = await readFile(
    new URL("src/list.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(rootSource, /NativeOrderedListProps/);
  assert.doesNotMatch(primitiveIndexSource, /^"use client";/);
  assert.doesNotMatch(subpathSource, /^"use client";/);
});
