import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Badge,
  BadgeRoot,
} from "../../dist/index.js";

test("BadgeRoot renders a structural wrapper", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BadgeRoot,
      { className: "badge-class" },
      React.createElement("span", null, "Inbox"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /data-slot="badge"/);
  assert.match(html, /class="badge-class"/);
  assert.match(html, /<span>Inbox<\/span>/);
  assert.equal(Badge.Root, BadgeRoot);
});

test("BadgeRoot supports asChild element merging", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BadgeRoot,
      { asChild: true, className: "badge-class" },
      React.createElement("strong", { className: "strong-class" }, "Inbox"),
    ),
  );

  assert.match(html, /^<strong/);
  assert.match(html, /data-slot="badge"/);
  assert.match(html, /class="strong-class badge-class"/);
  assert.match(html, />Inbox<\/strong>$/);
});

test("BadgeRoot preserves native props, custom slots, and render composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      BadgeRoot,
      {
        id: "inbox-count",
        title: "Open issues",
        "data-slot": "custom-badge",
        "data-prop-check": "badge-root",
        render: (props) => React.createElement("strong", props, "12"),
      },
    ),
  );

  assert.match(html, /^<strong/);
  assert.match(html, /id="inbox-count"/);
  assert.match(html, /title="Open issues"/);
  assert.match(html, /data-slot="custom-badge"/);
  assert.match(html, /data-prop-check="badge-root"/);
  assert.match(html, />12<\/strong>$/);
});

test("Badge primitive and public subpath stay server-safe", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/badge/BadgeRoot.tsx", packageRoot),
    "utf8",
  );
  const entrySource = await readFile(
    new URL("src/badge.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(rootSource, /^"use client";/);
  assert.doesNotMatch(entrySource, /^"use client";/);
});
