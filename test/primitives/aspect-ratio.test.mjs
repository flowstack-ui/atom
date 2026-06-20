import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  AspectRatio,
  AspectRatioRoot,
} from "../../dist/index.js";

test("AspectRatioRoot renders ratio style and native DOM attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AspectRatio.Root,
      {
        ratio: 4 / 3,
        id: "media",
        title: "Media frame",
        style: { width: "100%" },
        "data-testid": "aspect",
      },
      React.createElement("img", { src: "/demo.jpg", alt: "Demo" }),
    ),
  );

  assert.match(html, /<div id="media"/);
  assert.match(html, /id="media"/);
  assert.match(html, /title="Media frame"/);
  assert.match(html, /data-testid="aspect"/);
  assert.match(html, /data-slot="aspect-ratio"/);
  assert.doesNotMatch(html, /data-ratio=/);
  assert.match(html, /style="width:100%;aspect-ratio:1.3333333333333333"/);
  assert.equal(AspectRatio.Root, AspectRatioRoot);
});

test("AspectRatioRoot normalizes invalid ratios", () => {
  const html = renderToStaticMarkup(
    React.createElement(AspectRatioRoot, { ratio: 0 }, "Media"),
  );

  assert.doesNotMatch(html, /data-ratio=/);
  assert.match(html, /aspect-ratio:1.7777777777777777/);
});

test("AspectRatio primitive barrel does not create a client boundary", async () => {
  const indexSource = await readFile(
    new URL("src/primitives/aspect-ratio/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(indexSource, /^"use client";/);
});
