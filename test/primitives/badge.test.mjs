import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
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
