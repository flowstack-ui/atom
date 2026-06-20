"use client";

import { RadioGroupRoot, RadioRoot } from "./primitives/radio-group/index.js";

export {
  RadioGroupContextProvider,
  RadioGroupRoot,
  RadioRoot,
  useRadioGroupContext,
} from "./primitives/radio-group/index.js";
export type {
  RadioGroupContextValue,
  RadioGroupRootProps,
  RadioRootProps,
} from "./primitives/radio-group/index.js";

export const RadioGroup = {
  Root: RadioGroupRoot,
  Radio: RadioRoot,
} as const;
