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
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

function installDom() {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id='root'></div></body></html>",
    { pretendToBeVisual: true, url: "https://example.test/" },
  );
  const keys = [
    "window", "document", "HTMLElement", "Element", "Node", "Event",
    "KeyboardEvent", "IS_REACT_ACT_ENVIRONMENT",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    IS_REACT_ACT_ENVIRONMENT: true,
  });

  const scrollCalls = [];
  dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView(options) {
    scrollCalls.push({ element: this, options });
  };

  return {
    container: dom.window.document.getElementById("root"),
    scrollCalls,
    cleanup() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

async function press(target, key, options = {}) {
  let event;
  await React.act(async () => {
    event = new window.KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    target.dispatchEvent(event);
  });
  return event;
}

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
  assert.match(source, /scrollIntoView\(\{ block: "nearest", inline: "nearest" \}\)/);
});

test("Feed keyboard navigation focuses and reveals articles and outside targets", async () => {
  const { container, scrollCalls, cleanup } = installDom();
  const root = createRoot(container);

  try {
    await React.act(async () => root.render(
      React.createElement(React.Fragment, null,
        React.createElement("button", { id: "before" }, "Before feed"),
        React.createElement(Feed.Root, { "aria-label": "Updates" },
          React.createElement(Feed.Item, { id: "first" },
            React.createElement("button", { id: "first-action" }, "Open first"),
          ),
          React.createElement(Feed.Item, { id: "second" }, "Second"),
          React.createElement(Feed.Item, { id: "third" }, "Third"),
        ),
        React.createElement("button", { id: "after" }, "After feed"),
      ),
    ));

    const firstAction = container.querySelector("#first-action");
    const first = container.querySelector("#first");
    const second = container.querySelector("#second");
    const third = container.querySelector("#third");
    const before = container.querySelector("#before");
    const after = container.querySelector("#after");

    firstAction.focus();
    assert.equal((await press(firstAction, "PageDown")).defaultPrevented, true);
    assert.equal(document.activeElement, second);
    assert.deepEqual(scrollCalls.at(-1), {
      element: second,
      options: { block: "nearest", inline: "nearest" },
    });

    await press(second, "PageUp");
    assert.equal(document.activeElement, first);
    await press(first, "PageUp");
    assert.equal(document.activeElement, first);
    await press(first, "PageDown");
    await press(second, "PageDown");
    await press(third, "PageDown");
    assert.equal(document.activeElement, third);

    await press(third, "Home", { ctrlKey: true });
    assert.equal(document.activeElement, before);
    assert.equal(scrollCalls.at(-1).element, before);

    first.focus();
    await press(first, "End", { metaKey: true });
    assert.equal(document.activeElement, after);
    assert.equal(scrollCalls.at(-1).element, after);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Feed consumer key handler can cancel built-in focus and scrolling", async () => {
  const { container, scrollCalls, cleanup } = installDom();
  const root = createRoot(container);

  try {
    await React.act(async () => root.render(
      React.createElement(Feed.Root, {
        onKeyDown: (event) => event.preventDefault(),
      },
      React.createElement(Feed.Item, { id: "first" }, "First"),
      React.createElement(Feed.Item, { id: "second" }, "Second"),
      ),
    ));
    const first = container.querySelector("#first");
    first.focus();
    await press(first, "PageDown");
    assert.equal(document.activeElement, first);
    assert.deepEqual(scrollCalls, []);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
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
