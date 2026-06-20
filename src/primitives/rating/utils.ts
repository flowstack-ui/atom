export type RatingItemDataState = "empty" | "partial" | "full";

export interface RatingRange {
  min: number;
  max: number;
}

export interface RatingItemState {
  /** Fill percentage from 0 to 100. */
  fill: number;
  /** Data state for styling. */
  dataState: RatingItemDataState;
}

export function normalizeRatingRange(min = 0, max = 5): RatingRange {
  if (max > min) return { min, max };
  return { min, max: min + 5 };
}

export function clampRatingValue(value: number, min = 0, max = 5): number {
  const range = normalizeRatingRange(min, max);
  return Math.min(Math.max(value, range.min), range.max);
}

export function snapRatingValue(value: number, step = 1, min = 0): number {
  const safeStep = step > 0 ? step : 1;
  const offset = value - min;
  const snapped = Math.round(offset / safeStep) * safeStep + min;
  const decimals = countDecimals(safeStep);
  return Number.parseFloat(snapped.toFixed(decimals));
}

export function getRatingValueLabel(value: number, min = 0, max = 5): string {
  const range = normalizeRatingRange(min, max);
  return `${value} out of ${range.max}`;
}

export function getRatingItemState(
  currentValue: number,
  itemValue: number,
  min = 0,
): RatingItemState {
  const lowerBound = Math.max(min, itemValue - 1);
  const rawFill =
    itemValue <= lowerBound
      ? currentValue >= itemValue
        ? 100
        : 0
      : ((currentValue - lowerBound) / (itemValue - lowerBound)) * 100;
  const fill = Number.parseFloat(Math.min(Math.max(rawFill, 0), 100).toFixed(6));
  const dataState = fill >= 100 ? "full" : fill <= 0 ? "empty" : "partial";

  return { fill, dataState };
}

function countDecimals(value: number): number {
  const text = String(value);
  if (text.includes("e-")) {
    const [, exponent] = text.split("e-");
    return Number.parseInt(exponent ?? "0", 10);
  }
  const dotIndex = text.indexOf(".");
  return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
}
