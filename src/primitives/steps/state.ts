export function normalizeStepsCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
export function normalizeStep(value: number, count: number): number {
  return Number.isFinite(value) ? Math.min(count, Math.max(0, Math.floor(value))) : 0;
}
/** Pure forward-validation rule shared by all navigation paths. */
export function firstInvalidStep(current: number, target: number, isValid?: (index: number) => boolean): number | undefined {
  for (let index = current; index < target; index += 1) {
    if (isValid && !isValid(index)) return index;
  }
  return undefined;
}
