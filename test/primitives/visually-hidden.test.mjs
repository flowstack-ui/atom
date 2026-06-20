import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  VisuallyHidden,
  VisuallyHiddenRoot,
} from "../../dist/index.js";

test("VisuallyHiddenRoot hides visually without class-based styling", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      VisuallyHidden.Root,
      {
        id: "search-label",
        className: "consumer-class",
        style: { color: "red" },
      },
      "Search",
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /id="search-label"/);
  assert.match(html, /class="consumer-class"/);
  assert.match(html, /data-slot="visually-hidden"/);
  assert.match(html, /position:absolute/);
  assert.match(html, /clip:rect\(0, 0, 0, 0\)/);
  assert.doesNotMatch(html, /sr-only/);
  assert.equal(VisuallyHidden.Root, VisuallyHiddenRoot);
});
