import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Feed,
  FeedItem,
  FeedRoot,
} from "../../dist/index.js";

test("Feed compound parts render WAI-ARIA feed anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Feed.Root,
      {
        busy: true,
        setSize: "unknown",
        "aria-label": "Activity",
      },
      React.createElement(
        Feed.Item,
        { index: 0 },
        React.createElement("h2", null, "First post"),
      ),
      React.createElement(
        Feed.Item,
        { position: 2, setSize: 10 },
        React.createElement("h2", null, "Second post"),
      ),
      React.createElement(
        Feed.Item,
        null,
        React.createElement("h2", null, "Unpositioned post"),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="feed"/);
  assert.match(html, /aria-label="Activity"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /data-slot="feed"/);
  assert.match(html, /data-busy=""/);
  assert.match(html, /<article role="article" tabindex="0" aria-posinset="1" aria-setsize="-1" data-slot="feed-item" data-position="1" data-setsize="unknown">/);
  assert.match(html, /<article role="article" tabindex="0" aria-posinset="2" aria-setsize="10" data-slot="feed-item" data-position="2" data-setsize="10">/);
  assert.match(html, /<article role="article" tabindex="0" aria-setsize="-1" data-slot="feed-item" data-setsize="unknown">/);
  assert.equal(Feed.Root, FeedRoot);
  assert.equal(Feed.Item, FeedItem);
});

test("Feed parts support slot overrides and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      FeedRoot,
      {
        render: React.createElement("section", { className: "consumer-feed" }),
        setSize: 3,
        "data-slot": "custom-feed",
      },
      React.createElement(
        FeedItem,
        {
          asChild: true,
          position: 3,
          "data-slot": "custom-feed-item",
        },
        React.createElement("article", { className: "consumer-item" }, "Done"),
      ),
    ),
  );

  assert.match(html, /^<section/);
  assert.match(html, /class="consumer-feed"/);
  assert.match(html, /role="feed"/);
  assert.match(html, /data-slot="custom-feed"/);
  assert.match(html, /<article class="consumer-item" role="article" tabindex="0" aria-posinset="3" aria-setsize="3" data-slot="custom-feed-item" data-position="3" data-setsize="3">Done<\/article>/);
});

test("Feed namespace maps compound parts", () => {
  assert.equal(FeedRoot, Feed.Root);
  assert.equal(FeedItem, Feed.Item);
});

test("Feed source keeps WAI-ARIA keyboard navigation in Root", async () => {
  const source = await readFile(
    new URL("src/primitives/feed/FeedRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /event\.key === "PageDown"/);
  assert.match(source, /event\.key !== "PageUp"/);
  assert.match(source, /event\.key === "Home"/);
  assert.match(source, /event\.key === "End"/);
  assert.match(source, /getAttribute\("role"\) === "article"/);
  assert.match(source, /focusOutsideFeed\("before"\)/);
  assert.match(source, /focusOutsideFeed\("after"\)/);
});

test("Feed entrypoints keep client boundaries only where needed", async () => {
  const primitiveIndexSource = await readFile(
    new URL("src/primitives/feed/index.ts", packageRoot),
    "utf8",
  );
  const subpathSource = await readFile(
    new URL("src/feed.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(primitiveIndexSource, /^"use client";/);
  assert.match(subpathSource, /^"use client";/);
});
