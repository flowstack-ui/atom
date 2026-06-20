"use client";

import { NumberInputRoot } from "./primitives/number-input/index.js";

export {
  NumberInputRoot,
  clampNumberValue,
  formatNumber,
  parseNumber,
  roundToPrecision,
  stepNumberValue,
} from "./primitives/number-input/index.js";
export type {
  NumberInputRenderState,
  NumberInputRootProps,
} from "./primitives/number-input/index.js";

export const NumberInput = {
  Root: NumberInputRoot,
} as const;
