import { assert, test } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { normalizePopoverAnchorRect } from "../../dist/_internal/primitives/popover/anchor-rect.js";

test("Popover preserves DOMRect, DOMRectReadOnly and plain virtual rectangle geometry", () => {
  const dom = new JSDOM();
  try {
    const expected = { x: 30, y: 50, width: 80, height: 20, top: 50, left: 30, right: 110, bottom: 70 };
    for (const rect of [
      new dom.window.DOMRect(30, 50, 80, 20),
      new dom.window.DOMRectReadOnly(30, 50, 80, 20),
      { x: 30, y: 50, width: 80, height: 20 },
    ]) assert.deepEqual(normalizePopoverAnchorRect(rect), expected);
    assert.deepEqual(normalizePopoverAnchorRect(new dom.window.DOMRect(30, 50, 0, 0)),
      { x: 30, y: 50, width: 0, height: 0, top: 50, left: 30, right: 30, bottom: 50 });
  } finally { dom.window.close(); }
});
