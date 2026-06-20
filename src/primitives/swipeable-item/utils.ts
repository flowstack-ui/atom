import type {
  SwipeableItemOpenSide,
  SwipeableItemSide,
} from "./context.js";
import type { DirectionValue } from "../direction/index.js";

export function getSwipeableItemOffsetForSide(
  side: SwipeableItemOpenSide,
  dir: DirectionValue,
  startSize: number,
  endSize: number,
): number {
  if (side === "start") return dir === "rtl" ? -startSize : startSize;
  if (side === "end") return dir === "rtl" ? endSize : -endSize;
  return 0;
}

export function getSwipeableItemSideForOffset(
  offset: number,
  dir: DirectionValue,
): SwipeableItemOpenSide {
  if (offset > 0) return dir === "rtl" ? "end" : "start";
  if (offset < 0) return dir === "rtl" ? "start" : "end";
  return null;
}

export function getSwipeableItemSizeForSide(
  side: SwipeableItemOpenSide,
  startSize: number,
  endSize: number,
): number {
  if (side === "start") return startSize;
  if (side === "end") return endSize;
  return 0;
}

export function clampSwipeableItemOffset(
  offset: number,
  dir: DirectionValue,
  startSize: number,
  endSize: number,
): number {
  const maxPositive = dir === "rtl" ? endSize : startSize;
  const maxNegative = dir === "rtl" ? startSize : endSize;
  return Math.max(-maxNegative, Math.min(maxPositive, offset));
}

export function getSwipeableItemSideFromKey(
  key: string,
  dir: DirectionValue,
): SwipeableItemSide | null {
  if (key === "ArrowLeft") return dir === "rtl" ? "start" : "end";
  if (key === "ArrowRight") return dir === "rtl" ? "end" : "start";
  return null;
}
