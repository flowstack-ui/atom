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
  if (max > min) return { min, max };
  return { min, max: min + 100 };
}

export function clampProgressValue(value: number, min = 0, max = 100): number {
  const range = normalizeProgressRange(min, max);
  return Math.min(Math.max(value, range.min), range.max);
}

export function getProgressPercent(value: number, min = 0, max = 100): number {
  const range = normalizeProgressRange(min, max);
  return ((clampProgressValue(value, range.min, range.max) - range.min) / (range.max - range.min)) * 100;
}

export function getProgressState({
  value,
  min = 0,
  max = 100,
}: ProgressStateOptions): ProgressState {
  const range = normalizeProgressRange(min, max);
  const isIndeterminate = value === null || value === undefined;
  const clampedValue = isIndeterminate ? null : clampProgressValue(value, range.min, range.max);
  const percent =
    clampedValue === null ? null : ((clampedValue - range.min) / (range.max - range.min)) * 100;
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
