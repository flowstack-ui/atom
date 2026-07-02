export function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return roundSliderNumber(((value - min) / (max - min)) * 100);
}

export function percentToValue(
  percent: number,
  min: number,
  max: number,
  step: number,
): number {
  const raw = min + (percent / 100) * (max - min);
  return snapToStep(raw, step, min);
}

export function clampSliderValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function snapToStep(value: number, step: number, min: number): number {
  const offset = value - min;
  const snapped = Math.round(offset / step) * step + min;
  const decimals = countDecimals(step);
  return Number.parseFloat(snapped.toFixed(decimals));
}

function roundSliderNumber(value: number): number {
  return Number.parseFloat(value.toFixed(6));
}

function countDecimals(value: number): number {
  const text = String(value);
  const dotIndex = text.indexOf(".");
  return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
}

export function getClosestThumbIndex(clickValue: number, values: number[]): number {
  let closestIndex = 0;
  let closestDistance = Math.abs(values[0] - clickValue);

  for (let index = 1; index < values.length; index += 1) {
    const distance = Math.abs(values[index] - clickValue);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}
