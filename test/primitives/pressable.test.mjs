import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Pressable,
  PressableRoot,
} from "../../dist/index.js";

test("PressableRoot renders a native button by default", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pressable.Root,
      {
        id: "open-card",
        title: "Open card",
        "data-testid": "pressable",
      },
      "Open",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /id="open-card"/);
  assert.match(html, /title="Open card"/);
  assert.match(html, /data-testid="pressable"/);
  assert.match(html, /data-slot="pressable"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.match(html, />Open<\/button>$/);
  assert.equal(Pressable.Root, PressableRoot);
});

test("PressableRoot adds button semantics to custom rendered elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PressableRoot,
      {
        render: "div",
        disabled: true,
        className: "pressable-class",
        "data-slot": "card-action",
      },
      "Open",
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-slot="card-action"/);
  assert.match(html, /class="pressable-class"/);
  assert.match(html, />Open<\/div>$/);
});

test("Pressable source exposes pointer press state and disabled guards", async () => {
  const source = await readFile(
    new URL("src/primitives/pressable/PressableRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /const \[pressed, setPressed\] = useState\(false\)/);
  assert.match(source, /setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(source, /releasePointerCapture\?\.\(event\.pointerId\)/);
  assert.match(source, /const handleLostPointerCapture = useCallback/);
  assert.match(source, /onLostPointerCapture: handleLostPointerCapture/);
  assert.match(source, /"data-pressed"/);
  assert.match(source, /if \(disabled\) \{\s*if \(isPressableActivationKey\(event\.key\)\)/);
  assert.match(source, /if \(event\.key === " "\) return;\s*event\.currentTarget\.click\(\);/);
  assert.match(source, /const handleKeyUp = useCallback/);
  assert.match(source, /if \(event\.key !== " "\) return;\s*event\.preventDefault\(\);\s*event\.currentTarget\.click\(\);/);
  assert.match(source, /onKeyUp: handleKeyUp/);
});

test("Pressable primitive barrel does not create a client boundary", async () => {
  const indexSource = await readFile(
    new URL("src/primitives/pressable/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(indexSource, /^"use client";/);
});
