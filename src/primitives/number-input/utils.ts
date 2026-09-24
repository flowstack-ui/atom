function countDecimals(value: number): number {
  if (Math.floor(value) === value) return 0;
  const [coefficient, exponent = "0"] = value.toString().split("e");
  const fraction = coefficient!.split(".")[1]?.length ?? 0;
  return Math.min(100, Math.max(0, fraction - Number(exponent)));
}

export function clampNumberValue(
  value: number,
  min: number | undefined,
  max: number | undefined,
): number {
  let clamped = value;
  if (min !== undefined) clamped = Math.max(clamped, min);
  if (max !== undefined) clamped = Math.min(clamped, max);
  return clamped;
}

export function roundToPrecision(
  value: number,
  precision: number | undefined,
  step: number,
): number {
  if (precision !== undefined) {
    return Number(value.toFixed(precision));
  }

  const stepDecimals = countDecimals(step);
  return stepDecimals > 0 ? Number(value.toFixed(stepDecimals)) : value;
}

export function stepNumberValue(
  current: number,
  step: number,
  direction: 1 | -1,
  precision: number | undefined,
): number {
  return roundToPrecision(current + step * direction, precision, step);
}

export function parseNumber(input: string): number | null {
  if (input === "" || input === "-" || input === ".") return null;
  const value = Number(input);
  return Number.isNaN(value) ? null : value;
}

export function formatNumber(
  value: number,
  precision: number | undefined,
  step: number,
): string {
  if (precision !== undefined) {
    return value.toFixed(precision);
  }

  const stepDecimals = countDecimals(step);
  return stepDecimals > 0 ? value.toFixed(Math.max(stepDecimals, countDecimals(value))) : String(value);
}
