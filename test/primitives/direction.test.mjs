import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Direction,
  DirectionProvider,
  useDirection,
} from "../../dist/index.js";

test("Direction namespace provides direction context", () => {
  function DirectionProbe() {
    return React.createElement("span", null, useDirection());
  }

  const html = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(DirectionProbe),
    ),
  );

  assert.equal(Direction.Provider, DirectionProvider);
  assert.equal(html, "<span>rtl</span>");
});
