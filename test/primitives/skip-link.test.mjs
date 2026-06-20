import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  SkipLink,
  SkipLinkRoot,
  SkipLinkTarget,
} from "../../dist/index.js";

test("SkipLinkRoot renders a same-page skip anchor", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SkipLink.Root,
      {
        href: "#content",
        title: "Skip navigation",
        "data-testid": "skip-link",
      },
      "Skip",
    ),
  );

  assert.match(html, /^<a/);
  assert.match(html, /href="#content"/);
  assert.match(html, /title="Skip navigation"/);
  assert.match(html, /data-testid="skip-link"/);
  assert.match(html, /data-slot="skip-link"/);
  assert.match(html, />Skip<\/a>$/);
  assert.equal(SkipLink.Root, SkipLinkRoot);
});

test("SkipLinkTarget renders a programmatically focusable target", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SkipLinkTarget,
      {
        id: "content",
        className: "main-region",
      },
      "Main",
    ),
  );

  assert.match(html, /^<main/);
  assert.match(html, /id="content"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /data-slot="skip-link-target"/);
  assert.match(html, /class="main-region"/);
  assert.match(html, />Main<\/main>$/);
  assert.equal(SkipLink.Target, SkipLinkTarget);
});

test("SkipLink source guards malformed hash decoding without making the barrel client-only", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/skip-link/SkipLinkRoot.tsx", packageRoot),
    "utf8",
  );
  const indexSource = await readFile(
    new URL("src/primitives/skip-link/index.ts", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /try \{\s*decodedId = decodeURIComponent\(targetId\);/);
  assert.match(rootSource, /catch \{\s*decodedId = targetId;/);
  assert.doesNotMatch(rootSource, /focusTarget \|\| event\.defaultPrevented/);
  assert.doesNotMatch(indexSource, /^"use client";/);
});
