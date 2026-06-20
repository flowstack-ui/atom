import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  DividerRoot,
} from "../../dist/index.js";

test("DividerRoot resolves decorative and semantic separator attributes", () => {
  const decorative = renderToStaticMarkup(
    React.createElement(DividerRoot, { className: "divider-class" }),
  );
  const semantic = renderToStaticMarkup(
    React.createElement(DividerRoot, { decorative: false, orientation: "vertical" }),
  );

  assert.match(decorative, /^<hr/);
  assert.match(decorative, /role="none"/);
  assert.match(decorative, /data-slot="divider"/);
  assert.match(decorative, /class="divider-class"/);
  assert.match(semantic, /^<hr/);
  assert.match(semantic, /role="separator"/);
  assert.match(semantic, /aria-orientation="vertical"/);
});

test("DividerRoot supports labelled semantic content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DividerRoot,
      { decorative: false, "aria-label": "Section break" },
      "Section break",
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="separator"/);
  assert.match(html, /data-slot="divider"/);
  assert.match(html, /aria-label="Section break"/);
  assert.match(html, />Section break<\/div>$/);
});

test("DividerRoot supports asChild element merging", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DividerRoot,
      { asChild: true, className: "divider-class", decorative: false },
      React.createElement("div", { className: "child-class" }, "or"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="separator"/);
  assert.match(html, /data-slot="divider"/);
  assert.match(html, /class="child-class divider-class"/);
  assert.match(html, />or<\/div>$/);
});
