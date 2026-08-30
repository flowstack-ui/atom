import {
  assert,
  test,
  React,
  renderToStaticMarkup,
  readFile,
  packageRoot,
} from "../test-utils.mjs";

import {
  Highlight,
  HighlightMatch,
  HighlightRoot,
  findHighlightSegments,
} from "../../dist/index.js";

test("findHighlightSegments preserves text and resolves overlapping queries", () => {
  const segments = findHighlightSegments("Component components", {
    query: ["component", "components"],
  });

  assert.deepEqual(segments, [
    { text: "Component", match: true, start: 0, end: 9, query: "component" },
    { text: " ", match: false, start: 9, end: 10 },
    { text: "components", match: true, start: 10, end: 20, query: "components" },
  ]);
  assert.equal(segments.map(({ text }) => text).join(""), "Component components");
});

test("findHighlightSegments supports literal, whole-word, case, and first-match options", () => {
  assert.deepEqual(
    findHighlightSegments("café caféine CAFÉ", {
      query: "café",
      exactMatch: true,
      matchAll: true,
    }).filter(({ match }) => match).map(({ text }) => text),
    ["café", "CAFÉ"],
  );

  assert.deepEqual(
    findHighlightSegments("a+b A+B a+b", {
      query: "a+b",
      ignoreCase: false,
      matchAll: false,
    }).filter(({ match }) => match).map(({ text }) => text),
    ["a+b"],
  );
});

test("findHighlightSegments handles empty and absent queries without losing text", () => {
  assert.deepEqual(findHighlightSegments("Plain text", { query: ["", "missing"] }), [
    { text: "Plain text", match: false, start: 0, end: 10 },
  ]);
  assert.deepEqual(findHighlightSegments("", { query: "anything" }), []);
});

test("Highlight renders native root and match semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(HighlightRoot, {
      text: "Build with Brick",
      query: "Brick",
      id: "result",
      className: "query-result",
      "data-prop-check": "highlight-root",
    }),
  );

  assert.equal(Highlight.Root, HighlightRoot);
  assert.equal(Highlight.Match, HighlightMatch);
  assert.match(html, /^<span/);
  assert.match(html, /id="result"/);
  assert.match(html, /class="query-result"/);
  assert.match(html, /data-slot="highlight"/);
  assert.match(html, /data-prop-check="highlight-root"/);
  assert.match(html, /Build with <mark data-slot="highlight-match">Brick<\/mark>/);
});

test("Highlight root render and Match asChild preserve composition", () => {
  const root = renderToStaticMarkup(
    React.createElement(HighlightRoot, {
      text: "Atom behavior",
      query: "Atom",
      render: (props) => React.createElement("p", props),
    }),
  );
  const match = renderToStaticMarkup(
    React.createElement(
      HighlightMatch,
      { asChild: true, className: "matched" },
      React.createElement("strong", { className: "authored" }, "Atom"),
    ),
  );

  assert.match(root, /^<p/);
  assert.match(root, /<mark data-slot="highlight-match">Atom<\/mark> behavior/);
  assert.match(match, /^<strong/);
  assert.match(match, /class="authored matched"/);
  assert.match(match, /data-slot="highlight-match"/);
});

test("Highlight primitive and public subpath stay server-safe", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/highlight/HighlightRoot.tsx", packageRoot),
    "utf8",
  );
  const entrySource = await readFile(new URL("src/highlight.ts", packageRoot), "utf8");

  assert.doesNotMatch(rootSource, /^"use client";/);
  assert.doesNotMatch(entrySource, /^"use client";/);
  const subpath = await import("@flowstack-ui/atom/highlight");
  assert.equal(subpath.Highlight.Root, subpath.HighlightRoot);
});
