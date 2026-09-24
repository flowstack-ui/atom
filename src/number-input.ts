"use client";

import { NumberInputDecrement, NumberInputIncrement, NumberInputInput, NumberInputRoot, NumberInputRootProvider, NumberInputLabel, NumberInputValueText, NumberInputContext, NumberInputScrubber } from "./primitives/number-input/index.js";

export { NumberInputRootProvider, NumberInputLabel, NumberInputValueText, NumberInputContext, NumberInputScrubber, useNumberInput } from "./primitives/number-input/index.js";
export type { NumberInputRootProviderProps, NumberInputLabelProps, NumberInputValueTextProps, NumberInputContextProps, NumberInputScrubberProps, UseNumberInputOptions, NumberInputIds, NumberInputTranslations, NumberInputValueChangeDetails, NumberInputValueInvalidDetails, NumberInputFocusChangeDetails } from "./primitives/number-input/index.js";

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
  RootProvider: NumberInputRootProvider,
  Label: NumberInputLabel,
  ValueText: NumberInputValueText,
  Context: NumberInputContext,
  Scrubber: NumberInputScrubber,
  Input: NumberInputInput,
  Increment: NumberInputIncrement,
  Decrement: NumberInputDecrement,
} as const;
