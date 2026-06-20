import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Label,
  LabelRoot,
} from "../../dist/index.js";

test("LabelRoot renders native label attributes and state data attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Label.Root,
      {
        htmlFor: "email",
        id: "email-label",
        required: true,
        invalid: true,
        disabled: true,
        readOnly: true,
        title: "Email field",
        "data-testid": "label-root",
      },
      "Email",
    ),
  );

  assert.match(html, /^<label/);
  assert.match(html, /for="email"/);
  assert.match(html, /id="email-label"/);
  assert.match(html, /title="Email field"/);
  assert.match(html, /data-testid="label-root"/);
  assert.match(html, /data-slot="label"/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.equal(Label.Root, LabelRoot);
});

test("Label primitive stays server-safe", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/label/LabelRoot.tsx", packageRoot),
    "utf8",
  );
  const entrySource = await readFile(
    new URL("src/label.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(rootSource, /^"use client";/);
  assert.doesNotMatch(entrySource, /^"use client";/);
});
