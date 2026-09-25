import { assert, test } from "./test-utils.mjs";
import { getArrowDepth, arrowOffset } from "../dist/_internal/utils/floatingArrowPositioning.js";

function arrow(tag, side, width, height, artwork) {
  return {
    tagName: tag, getAttribute: () => side, firstElementChild: artwork,
    ownerDocument: { defaultView: { getComputedStyle: node => node === artwork ? artwork : ({ width, height }) } },
  };
}
test("arrow depth uses layout size on all sides, not transformed popup bounds", () => {
  for (const side of ["top", "bottom"]) assert.equal(getArrowDepth(arrow("svg", side, "20px", "10px")), 10);
  for (const side of ["left", "right"]) assert.equal(getArrowDepth(arrow("svg", side, "10px", "20px")), 10);
  assert.equal(getArrowDepth(null), 0);
});
test("span arrows measure rotated artwork without changing the public host", () => {
  const artwork = { width: "12px", height: "12px", transform: "matrix(0.70710678, 0.70710678, -0.70710678, 0.70710678, 0, 0)" };
  assert.ok(Math.abs(getArrowDepth(arrow("span", "bottom", "12px", "12px", artwork)) - 12 / Math.SQRT2) < 0.001);
});
test("gutter includes current arrow depth and remeasures after resize or removal", () => {
  const ref = { current: arrow("svg", "top", "20px", "10px") };
  const middleware = arrowOffset(ref, 4, 2);
  const resolve = middleware.options[0];
  assert.deepEqual(resolve(), { mainAxis: 14, crossAxis: 2 });
  ref.current = arrow("svg", "right", "16px", "32px");
  assert.deepEqual(resolve(), { mainAxis: 20, crossAxis: 2 });
  ref.current = null;
  assert.deepEqual(resolve(), { mainAxis: 4, crossAxis: 2 });
});
