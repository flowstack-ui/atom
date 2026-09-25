import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getVerticalNavigationGeometry } from "../../dist/_internal/primitives/navigation-menu/verticalGeometry.js";

test("vertical navigation constrains its connected side and flips near LTR/RTL edges", () => {
  const boundary = { left: 0, width: 1120 };
  const root = { left: 460, top: 100, width: 116, height: 140 };
  assert.deepEqual(getVerticalNavigationGeometry(root, boundary, 544, "ltr", 8, 8), { side: "right", left: 124, availableWidth: 528 });
  const ltrEdge = getVerticalNavigationGeometry({ ...root, left: 980 }, boundary, 400, "ltr", 8, 8);
  assert.equal(ltrEdge.side, "left");
  assert.equal(980 + ltrEdge.left + 400, 972);
  const rtlEdge = getVerticalNavigationGeometry({ ...root, left: 20 }, boundary, 400, "rtl", 8, 8);
  assert.equal(rtlEdge.side, "right");
  assert.equal(20 + rtlEdge.left, 144);
});

test("vertical navigation honors visual viewport origin and oversized panels", () => {
  const result = getVerticalNavigationGeometry({ left: 130, top: 0, width: 40, height: 30 }, { left: 100, width: 200 }, 1000, "rtl", 8, 8);
  assert.deepEqual(result, { side: "right", left: 48, availableWidth: 114 });
});
