import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import { Link, LinkRoot } from "../../dist/index.js";
import {
  Link as LinkSubpath,
  LinkRoot as LinkRootSubpath,
} from "../../dist/link.js";

test("Link renders one native anchor with native props and current state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Link.Root,
      {
        href: "/guides",
        "aria-current": "page",
        className: "docs-link",
        rel: "help",
        title: "Open guides",
      },
      "Read the guides",
    ),
  );

  assert.match(html, /^<a /);
  assert.match(html, /href="\/guides"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /class="docs-link"/);
  assert.match(html, /rel="help"/);
  assert.match(html, /title="Open guides"/);
  assert.match(html, /data-slot="link"/);
  assert.match(html, />Read the guides<\/a>$/);
  assert.doesNotMatch(html, /role=/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.doesNotMatch(html, /aria-disabled=/);
});

test("Link supports render and asChild destination ownership", () => {
  const renderHtml = renderToStaticMarkup(
    React.createElement(
      Link.Root,
      {
        render: React.createElement("a", {
          href: "/render-owned",
          className: "router-link",
        }),
        "data-route": "guides",
      },
      "Rendered guide",
    ),
  );
  const childHtml = renderToStaticMarkup(
    React.createElement(
      Link.Root,
      { asChild: true, className: "atom-link" },
      React.createElement(
        "a",
        { href: "/child-owned", className: "router-link" },
        "Child guide",
      ),
    ),
  );

  assert.match(renderHtml, /^<a href="\/render-owned" class="router-link"/);
  assert.match(renderHtml, /data-route="guides"/);
  assert.match(renderHtml, /data-slot="link"/);
  assert.match(childHtml, /^<a href="\/child-owned" class="router-link atom-link"/);
  assert.match(childHtml, /data-slot="link"/);
});

test("Link supports slot overrides and direct/subpath exports", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      LinkRoot,
      { href: "/reference", "data-slot": "reference-link" },
      "Reference",
    ),
  );

  assert.match(html, /data-slot="reference-link"/);
  assert.equal(Link.Root, LinkRoot);
  assert.equal(LinkSubpath.Root, LinkRootSubpath);
  assert.equal(LinkRoot, LinkRootSubpath);
});

test("Link primitive and public subpath stay server-safe", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/link/LinkRoot.tsx", packageRoot),
    "utf8",
  );
  const entrySource = await readFile(new URL("src/link.ts", packageRoot), "utf8");

  assert.doesNotMatch(rootSource, /^"use client";/);
  assert.doesNotMatch(entrySource, /^"use client";/);
  assert.doesNotMatch(rootSource, /onPress|aria-disabled|data-disabled/);
});
