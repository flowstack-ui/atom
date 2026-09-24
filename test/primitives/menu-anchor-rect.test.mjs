import { strict as assert } from "node:assert";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { normalizeMenuAnchorRect } from "../../dist/_internal/primitives/menu/anchorRect.js";
import { menuInertValue } from "../../dist/_internal/primitives/menu/inert.js";

test("closed menu inert serialization supports React 18 and 19", () => {
  assert.equal(menuInertValue(true, "18.3.1"), "");
  assert.equal(menuInertValue(true, "19.2.0"), true);
  assert.equal(menuInertValue(false, "18.3.1"), undefined);
  assert.equal(menuInertValue(false, "19.2.0"), undefined);
});

test("menu virtual anchors retain native DOMRect prototype coordinates", () => {
  const dom = new JSDOM("");
  try {
    const rect = new dom.window.DOMRect(120, 240, 80, 36);
    assert.equal(Object.prototype.hasOwnProperty.call(rect, "width"), false);
    assert.deepEqual(normalizeMenuAnchorRect(rect), {
      x: 120, y: 240, width: 80, height: 36,
      top: 240, left: 120, right: 200, bottom: 276,
    });
  } finally { dom.window.close(); }
});

test("menu virtual anchors support plain rectangles and missing rect fallback", () => {
  assert.equal(normalizeMenuAnchorRect({ x: -10, y: 4, width: 20, height: 0 }).right, 10);
  assert.deepEqual(normalizeMenuAnchorRect(null), {
    x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0,
  });
});
