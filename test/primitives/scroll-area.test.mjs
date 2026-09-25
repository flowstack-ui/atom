import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  ScrollArea,
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "../../dist/index.js";

test("ScrollArea extended anatomy has unique axis IDs and preserves native defaults", () => {
  const html = renderToStaticMarkup(React.createElement(ScrollArea.Root, { orientation: "both", ids: { scrollbar: "bar", thumb: "thumb" } },
    React.createElement(ScrollArea.Viewport, null, React.createElement(ScrollArea.Content, null, "Content")),
    React.createElement(ScrollArea.Scrollbar, null, React.createElement(ScrollArea.Thumb)),
    React.createElement(ScrollArea.Scrollbar, { orientation: "horizontal" }, React.createElement(ScrollArea.Thumb)),
    React.createElement(ScrollArea.Corner)));
  assert.match(html, /id="bar-vertical"/); assert.match(html, /id="bar-horizontal"/);
  assert.match(html, /id="thumb-horizontal"/); assert.doesNotMatch(html, /tabindex/);
  for (const name of ["Content", "Scrollbar", "Thumb", "Corner", "RootProvider", "Context"]) assert.equal(typeof ScrollArea[name] === "function" || typeof ScrollArea[name] === "object", true);
});

test("ScrollArea compound parts render headless scroll anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ScrollArea.Root,
      {
        orientation: "horizontal",
        id: "gallery-scroll",
        "data-testid": "scroll-root",
      },
      React.createElement(
        ScrollArea.Viewport,
        {
          focusable: true,
          "aria-label": "Gallery",
          title: "Scrollable gallery",
        },
        "Items",
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /id="gallery-scroll"/);
  assert.match(html, /data-testid="scroll-root"/);
  assert.match(html, /data-slot="scroll-area"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /title="Scrollable gallery"/);
  assert.match(html, /role="region"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-label="Gallery"/);
  assert.match(html, /data-slot="scroll-area-viewport"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, />Items<\/div><\/div>$/);
  assert.equal(ScrollArea.Root, ScrollAreaRoot);
  assert.equal(ScrollArea.Viewport, ScrollAreaViewport);
});

test("ScrollAreaViewport stays out of the Tab order unless requested", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ScrollAreaRoot,
      null,
      React.createElement(ScrollAreaViewport, null, "Items"),
    ),
  );

  assert.match(html, /data-slot="scroll-area-viewport"/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.doesNotMatch(html, /role="region"/);
});

test("ScrollAreaViewport strips unnamed region landmarks", () => {
  const unnamedHtml = renderToStaticMarkup(
    React.createElement(
      ScrollAreaRoot,
      null,
      React.createElement(ScrollAreaViewport, { role: "region" }, "Items"),
    ),
  );
  const namedHtml = renderToStaticMarkup(
    React.createElement(
      ScrollAreaRoot,
      null,
      React.createElement(
        ScrollAreaViewport,
        { role: "region", "aria-label": "Scrollable items" },
        "Items",
      ),
    ),
  );

  assert.doesNotMatch(unnamedHtml, /role="region"/);
  assert.match(namedHtml, /role="region"/);
  assert.match(namedHtml, /aria-label="Scrollable items"/);
});

test("ScrollArea primitive barrel does not create a client boundary", async () => {
  const indexSource = await readFile(
    new URL("src/primitives/scroll-area/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(indexSource, /^"use client";/);
});
