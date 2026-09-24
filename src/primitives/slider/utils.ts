export function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return roundSliderNumber(((value - min) / (max - min)) * 100);
}

export type SliderCollisionBehavior = "none" | "push" | "swap";

export interface SliderCollisionResult {
  values: number[];
  activeIndex: number;
}

export function normalizeSliderConfig(
  minValue: number,
  maxValue: number,
  stepValue: number,
  thumbCount: number,
  minStepsBetweenThumbs: number,
) {
  const min = Number.isFinite(minValue) ? minValue : 0;
  const requestedMax = Number.isFinite(maxValue) ? maxValue : 100;
  const max = Math.max(min, requestedMax);
  const step = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
  const requestedGap = Math.max(0, Number.isFinite(minStepsBetweenThumbs)
    ? minStepsBetweenThumbs * step
    : 0);
  const availableGap = thumbCount > 1 ? (max - min) / (thumbCount - 1) : requestedGap;
  return { min, max, step, minGap: Math.min(requestedGap, availableGap) };
}

export function normalizeSliderValues(
  input: number[],
  min: number,
  max: number,
  step: number,
  minGap: number,
): number[] {
  const values = input.length ? input : [min];
  const normalized = values
    .map((value) => clampSliderValue(Number.isFinite(value) ? value : min, min, max))
    .sort((a, b) => a - b);

  for (let index = 1; index < normalized.length; index += 1) {
    normalized[index] = Math.max(normalized[index], normalized[index - 1] + minGap);
  }
  for (let index = normalized.length - 2; index >= 0; index -= 1) {
    normalized[index] = Math.min(normalized[index], normalized[index + 1] - minGap);
  }
  return normalized.map((value) => clampSliderValue(value, min, max));
}

/** Applies pointer collision policy while preserving an ordered output array. */
export function applySliderCollision(
  current: number[],
  requestedValue: number,
  activeIndex: number,
  behavior: SliderCollisionBehavior,
  min: number,
  max: number,
  step: number,
  minGap: number,
): SliderCollisionResult {
  const requested = clampSliderValue(snapToStep(requestedValue, step, min), min, max);
  if (current.length <= 1) return { values: [requested], activeIndex: 0 };

  if (behavior === "none") {
    const values = [...current];
    const lower = activeIndex > 0 ? values[activeIndex - 1] + minGap : min;
    const upper = activeIndex < values.length - 1 ? values[activeIndex + 1] - minGap : max;
    values[activeIndex] = clampSliderValue(requested, lower, upper);
    return { values, activeIndex };
  }

  if (behavior === "swap") {
    const entries = current.map((value, index) => ({ value, active: index === activeIndex }));
    entries[activeIndex].value = requested;
    entries.sort((left, right) => left.value - right.value || Number(right.active) - Number(left.active));
    const nextActive = entries.findIndex((entry) => entry.active);
    const values = entries.map((entry) => entry.value);
    const lower = nextActive > 0 ? values[nextActive - 1] + minGap : min;
    const upper = nextActive < values.length - 1 ? values[nextActive + 1] - minGap : max;
    values[nextActive] = clampSliderValue(values[nextActive], lower, upper);
    return { values, activeIndex: nextActive };
  }

  const values = [...current];
  const delta = requested - values[activeIndex];
  values[activeIndex] = requested;
  if (delta > 0) {
    for (let index = activeIndex + 1; index < values.length; index += 1) {
      values[index] = Math.max(values[index], values[index - 1] + minGap);
    }
    const overflow = values[values.length - 1] - max;
    if (overflow > 0) {
      for (let index = values.length - 1; index >= activeIndex; index -= 1) values[index] -= overflow;
    }
  } else if (delta < 0) {
    for (let index = activeIndex - 1; index >= 0; index -= 1) {
      values[index] = Math.min(values[index], values[index + 1] - minGap);
    }
    const underflow = min - values[0];
    if (underflow > 0) {
      for (let index = 0; index <= activeIndex; index += 1) values[index] += underflow;
    }
  }
  return { values: normalizeSliderValues(values, min, max, step, minGap), activeIndex };
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
