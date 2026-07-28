"use client";

import { NumberInputDecrement, NumberInputIncrement, NumberInputInput, NumberInputRoot } from "./primitives/number-input/index.js";

export {
  NumberInputRoot,
  NumberInputInput,
  NumberInputIncrement,
  NumberInputDecrement,
  NumberInputContextProvider,
  useNumberInputContext,
  clampNumberValue,
  formatNumber,
  parseNumber,
  roundToPrecision,
  stepNumberValue,
} from "./primitives/number-input/index.js";
export type {
  NumberInputRenderState,
  NumberInputRootProps,
  NumberInputInputProps,
  NumberInputIncrementProps,
  NumberInputDecrementProps,
  NumberInputStepButtonProps,
  NumberInputContextValue,
} from "./primitives/number-input/index.js";

export const NumberInput = {
  Root: NumberInputRoot,
  Input: NumberInputInput,
  Increment: NumberInputIncrement,
  Decrement: NumberInputDecrement,
} as const;
