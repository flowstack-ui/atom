export interface DragDropActivation {
  /** Mouse/pen movement before lifting, in CSS pixels. Default 6. */
  distance?: number;
  /** Touch hold duration before lifting, in milliseconds. Default 220. */
  touchDelay?: number;
  /** Allowed movement during the touch hold, in CSS pixels. Default 8. */
  touchTolerance?: number;
}

export function resolveActivation(value: DragDropActivation = {}) {
  const result = { distance: value.distance ?? 6, touchDelay: value.touchDelay ?? 220, touchTolerance: value.touchTolerance ?? 8 };
  for (const [name, number] of Object.entries(result)) {
    if (!Number.isFinite(number) || number < 0) {
      throw new RangeError(`DragDrop activation ${name} must be a finite non-negative number.`);
    }
  }
  return result;
}
