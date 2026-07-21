import { assert, test } from "./test-utils.mjs";
import { getFloatingFallbackPlacements } from "../dist/_internal/utils/floatingPlacement.js";

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
