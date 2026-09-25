import { test, assert } from "../test-utils.mjs";
import { leaveMenuItem } from "../../dist/_internal/primitives/menu/pointer.js";

function fixture(controlledHighlight = false) {
  const changes = [];
  const focus = [];
  const row = { ownerDocument: { activeElement: null } };
  row.ownerDocument.activeElement = row;
  const context = {
    highlightedValue: "new", controlledHighlight,
    onHighlight: value => changes.push(value),
    contentRef: { current: { focus: options => focus.push(options) } },
  };
  return { context, changes, focus, row };
}

test("mouse departure clears ordinary highlight and returns focus without scrolling", () => {
  const f = fixture();
  leaveMenuItem({ pointerType: "mouse", currentTarget: f.row }, f.context, "new");
  assert.deepEqual(f.changes, [null]);
  assert.deepEqual(f.focus, [{ preventScroll: true }]);
});

test("controlled departure only requests a change; it does not independently move focus", () => {
  const f = fixture(true);
  leaveMenuItem({ pointerType: "mouse", currentTarget: f.row }, f.context, "new");
  assert.deepEqual(f.changes, [null]);
  assert.deepEqual(f.focus, []);
});

test("touch departure and departure from a non-highlighted row do not clear another item", () => {
  const f = fixture();
  leaveMenuItem({ pointerType: "touch", currentTarget: f.row }, f.context, "new");
  leaveMenuItem({ pointerType: "mouse", currentTarget: f.row }, f.context, "other");
  assert.deepEqual(f.changes, []);
  assert.deepEqual(f.focus, []);
});

test("departure does not steal focus from another control", () => {
  const f = fixture();
  f.row.ownerDocument.activeElement = {};
  leaveMenuItem({ pointerType: "mouse", currentTarget: f.row }, f.context, "new");
  assert.deepEqual(f.changes, [null]);
  assert.deepEqual(f.focus, []);
});
