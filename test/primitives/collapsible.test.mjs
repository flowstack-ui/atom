import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "../../dist/index.js";

test("Collapsible primitives render linked trigger and region", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CollapsibleRoot,
      { defaultOpen: true, className: "root-class" },
      React.createElement(CollapsibleTrigger, { className: "trigger-class" }, "Toggle"),
      React.createElement(CollapsibleContent, { className: "content-class" }, "Content"),
    ),
  );

  assert.match(html, /data-slot="collapsible-root"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /class="root-class"/);
  assert.match(html, /data-slot="collapsible-trigger"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+-content"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /class="trigger-class"/);
  assert.match(html, /data-slot="collapsible-content"/);
  assert.match(html, /role="region"/);
  assert.match(html, /aria-labelledby="[^"]+-trigger"/);
  assert.match(html, /class="content-class"/);
  assert.match(html, /Content/);
});

test("Collapsible disabled trigger exposes disabled semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CollapsibleRoot,
      { defaultOpen: true, disabled: true },
      React.createElement(CollapsibleTrigger, null, "Toggle"),
      React.createElement(CollapsibleContent, null, "Content"),
    ),
  );

  assert.match(html, /data-slot="collapsible-root"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-slot="collapsible-trigger"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
});

test("CollapsibleTrigger asChild exposes button semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CollapsibleRoot,
      { defaultOpen: true },
      React.createElement(
        CollapsibleTrigger,
        { asChild: true },
        React.createElement("div", { "data-testid": "custom-trigger" }, "Toggle"),
      ),
      React.createElement(CollapsibleContent, null, "Content"),
    ),
  );

  assert.match(html, /<div[^>]*data-testid="custom-trigger"/);
  assert.match(html, /role="button"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /tabindex="0"/);
});

test("CollapsibleContent keepMounted renders closed content as hidden", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CollapsibleRoot,
      null,
      React.createElement(CollapsibleTrigger, null, "Toggle"),
      React.createElement(CollapsibleContent, { keepMounted: true }, "Content"),
    ),
  );

  assert.match(html, /data-slot="collapsible-content"/);
  assert.match(html, /hidden=""/);
});
