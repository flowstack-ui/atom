import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
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
  assert.match(html, /data-orientation="vertical"/);
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

test("Collapsible propagates horizontal orientation to every public part", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CollapsibleRoot,
      { defaultOpen: true, orientation: "horizontal" },
      React.createElement(CollapsibleTrigger, null, "Toggle"),
      React.createElement(CollapsibleContent, null, "Content"),
    ),
  );

  assert.equal(html.match(/data-orientation="horizontal"/g)?.length, 3);
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

test("CollapsibleContent measures an entering panel before its first painted frame", async () => {
  const contentSource = await readFile(
    new URL("src/primitives/collapsible/CollapsibleContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(
    contentSource,
    /useMeasuredContentHeight\(contentRef, isMounted \|\| isOpen, children\)/,
  );
});
