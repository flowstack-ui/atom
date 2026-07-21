import { assert, test } from "./test-utils.mjs";
import {
  getFloatingAvailableSizeMiddleware,
  getFloatingFallbackPlacements,
  resolveFloatingDirection,
} from "../dist/_internal/utils/floatingPlacement.js";

test("floating direction prefers explicit, then reference, then provider direction", () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    getComputedStyle: () => ({ direction: "rtl" }),
  };

  try {
    assert.equal(resolveFloatingDirection("ltr", {}, "rtl"), "ltr");
    assert.equal(resolveFloatingDirection(undefined, {}, "ltr"), "rtl");
    assert.equal(resolveFloatingDirection(undefined, null, "rtl"), "rtl");
  } finally {
    globalThis.window = originalWindow;
  }
});

test("floating size middleware exposes headless available dimensions", async () => {
  const middleware = getFloatingAvailableSizeMiddleware();
  const values = new Map();
  const floating = {
    style: { setProperty: (name, value) => values.set(name, value) },
  };

  middleware.options[0].apply({
    availableHeight: 180,
    availableWidth: 240,
    elements: { floating },
  });

  assert.equal(values.get("--atom-floating-available-height"), "180px");
  assert.equal(values.get("--atom-floating-available-width"), "240px");
});

test("floating fallbacks preserve side, then opposite side, before changing axes", () => {
  assert.deepEqual(getFloatingFallbackPlacements("left", "start"), [
    "left", "left-end",
    "right-start", "right", "right-end",
    "bottom-start", "bottom", "bottom-end",
    "top-start", "top", "top-end",
  ]);
});

test("floating fallbacks preserve center alignment first on each side", () => {
  assert.deepEqual(getFloatingFallbackPlacements("top", "center"), [
    "top-start", "top-end",
    "bottom", "bottom-start", "bottom-end",
    "right", "right-start", "right-end",
    "left", "left-start", "left-end",
  ]);
});

test("floating end alignment falls back toward center before start", () => {
  assert.deepEqual(getFloatingFallbackPlacements("bottom", "end").slice(0, 5), [
    "bottom", "bottom-start", "top-end", "top", "top-start",
  ]);
});
