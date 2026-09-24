export type ProgressDataState = "loading" | "complete" | "indeterminate";

export interface ProgressStateOptions {
  /** Current progress value. `null` or `undefined` means indeterminate. */
  value?: number | null;
  /** Minimum progress value. @default 0 */
  min?: number;
  /** Maximum progress value. @default 100 */
  max?: number;
}

export interface ProgressState {
  /** Whether progress has no known current value. */
  isIndeterminate: boolean;
  /** Clamped current value, or null when indeterminate. */
  value: number | null;
  /** Minimum progress value. */
  min: number;
  /** Maximum progress value. */
  max: number;
  /** Completion percentage from 0 to 100, or null when indeterminate. */
  percent: number | null;
  /** String state exposed through data-state. */
  dataState: ProgressDataState;
}

function normalizeProgressRange(min: number, max: number): { min: number; max: number } {
  const finiteMin = Number.isFinite(min) ? min : 0;
  if (Number.isFinite(max) && max > finiteMin) return { min: finiteMin, max };
  const fallbackMax = finiteMin + 100;
  // At very large magnitudes adding 100 may round back to min or overflow.
  // A valid finite fallback is preferable to invalid ARIA and NaN geometry.
  return Number.isFinite(fallbackMax) && fallbackMax > finiteMin
    ? { min: finiteMin, max: fallbackMax }
    : { min: 0, max: 100 };
}

export function clampProgressValue(value: number, min = 0, max = 100): number {
  const range = normalizeProgressRange(min, max);
  return Number.isNaN(value) ? range.min : Math.min(Math.max(value, range.min), range.max);
}

export function getProgressPercent(value: number, min = 0, max = 100): number {
  const range = normalizeProgressRange(min, max);
  const clamped = clampProgressValue(value, range.min, range.max);
  const span = range.max - range.min;
  // Opposite-sign finite endpoints can have an infinite difference.
  const fraction = Number.isFinite(span)
    ? (clamped - range.min) / span
    : (clamped / 2 - range.min / 2) / (range.max / 2 - range.min / 2);
  return Math.min(100, Math.max(0, fraction * 100));
}

export function getProgressState({
  value,
  min = 0,
  max = 100,
}: ProgressStateOptions): ProgressState {
  const range = normalizeProgressRange(min, max);
  const isIndeterminate = value === null || value === undefined || Number.isNaN(value);
  const clampedValue = isIndeterminate ? null : clampProgressValue(value, range.min, range.max);
  const percent =
    clampedValue === null ? null : getProgressPercent(clampedValue, range.min, range.max);
  const dataState =
    clampedValue === null
      ? "indeterminate"
      : clampedValue >= range.max
        ? "complete"
        : "loading";

  return {
    isIndeterminate,
    value: clampedValue,
    min: range.min,
    max: range.max,
    percent,
    dataState,
  };
}
