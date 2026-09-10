import { assert, test } from "../test-utils.mjs";
import { constrainRect, resizeRect } from "../../dist/_internal/primitives/floating-panel/geometry.js";

const start = { x: 100, y: 100, width: 200, height: 100 };
test("FloatingPanel resize preserves the opposite edges on all eight axes", () => {
  for (const axis of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
    const next = resizeRect(start, { x: 20, y: 10 }, axis, {});
    assert.equal(next.x + next.width, axis.includes("w") ? 300 : next.x + next.width);
    assert.equal(next.y + next.height, axis.includes("n") ? 200 : next.y + next.height);
    assert.equal(next.width, axis.includes("w") ? 180 : axis.includes("e") ? 220 : 200);
    assert.equal(next.height, axis.includes("n") ? 90 : axis.includes("s") ? 110 : 100);
  }
});
test("FloatingPanel ratio and centered resize preserve their invariants", () => {
  for (const axis of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
    const next = resizeRect(start, { x: 50, y: 30 }, axis, {}, true, true);
    assert.equal(next.width / next.height, 2);
    assert.equal(next.x + next.width / 2, 200);
    assert.equal(next.y + next.height / 2, 150);
  }
});
test("FloatingPanel strict bounds retain anchored edges and cap effective minima", () => {
  const boundary = { x: 0, y: 0, width: 400, height: 300 };
  const next = resizeRect(start, { x: -500, y: -500 }, "nw", { boundary, contain: true });
  assert.deepEqual(next, { x: 0, y: 0, width: 300, height: 200 });
  assert.deepEqual(constrainRect(start, { boundary, contain: true, min: { width: 600, height: 600 } }), boundary);
  assert.throws(() => constrainRect(start, { min: {width:300,height:100}, max:{width:100,height:100} }), /minSize/);
  assert.throws(() => constrainRect({ ...start, width: NaN }, {}), /finite/);
});
