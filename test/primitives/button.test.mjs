import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Button,
  ButtonRoot,
} from "../../dist/index.js";

test("ButtonRoot renders native button semantics by default", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        loading: true,
        "aria-label": "Save changes",
        className: "button-class",
        "data-testid": "save-button",
      },
      "Save",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-label="Save changes"/);
  assert.match(html, /class="button-class"/);
  assert.match(html, /data-testid="save-button"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, /data-loading=""/);
  assert.equal(Button.Root, ButtonRoot);
});

test("ButtonRoot disables native buttons only for disabled state", () => {
  const html = renderToStaticMarkup(
    React.createElement(Button.Root, { disabled: true }, "Save"),
  );

  assert.match(html, /^<button/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
});

test("ButtonRoot renders safe anchor semantics for links", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        href: "https://example.com",
        target: "_blank",
        rel: "nofollow",
      },
      "External",
    ),
  );
  const disabledHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        href: "/disabled",
        disabled: true,
      },
      "Disabled link",
    ),
  );

  assert.match(html, /^<a/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="nofollow noopener noreferrer"/);
  assert.match(html, /data-slot="button"/);
  assert.match(disabledHtml, /^<a/);
  assert.doesNotMatch(disabledHtml, /href="\/disabled"/);
  assert.match(disabledHtml, /role="link"/);
  assert.match(disabledHtml, /tabindex="0"/);
  assert.match(disabledHtml, /aria-disabled="true"/);
  assert.match(disabledHtml, /data-disabled=""/);
});

test("ButtonRoot adds button semantics to custom non-native renders", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        render: "div",
        "data-testid": "custom-button",
      },
      "Custom",
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-testid="custom-button"/);
  assert.match(html, />Custom<\/div>/);
});

test("ButtonRoot adds button semantics to custom asChild elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        "data-testid": "custom-child-button",
      },
      React.createElement("span", null, "Custom child"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-testid="custom-child-button"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, />Custom child<\/span>/);
});

test("ButtonRoot preserves native asChild button semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        disabled: true,
      },
      React.createElement("button", null, "Native child"),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
});

test("ButtonRoot preserves native render element tabIndex", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        render: React.createElement("button", { tabIndex: -1 }),
      },
      "Composite item",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /tabindex="-1"/);
  assert.doesNotMatch(html, /role="button"/);
});

test("ButtonRoot source guards inactive state before consumer handlers", async () => {
  const source = await readFile(
    new URL("src/primitives/button/ButtonRoot.tsx", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(source, /composeEventHandlers\(onClick, handleClick\)/);
  assert.match(source, /childHasNativeButtonSemantics/);
  assert.match(source, /disabled: disabled \|\| undefined/);
  assert.match(source, /renderHasNativeButtonSemantics/);
  assert.match(source, /if \(isInactive\) \{\s*event\.preventDefault\(\);\s*return;\s*\}\s*onClick\?\.\(event\);/);
  assert.match(source, /if \(isInactive\) \{\s*event\.preventDefault\(\);\s*return;\s*\}\s*onKeyDown\?\.\(event\);/);
});
