"use client";

import { RadioGroupRoot, RadioRoot, RadioGroupIndicator } from "./primitives/radio-group/index.js";
import { RadioGroupRootProvider, RadioGroupLabel, RadioGroupItemRoot, RadioGroupItemHiddenInput, RadioGroupItemText, RadioGroupItemControl, RadioGroupItemDescription, RadioGroupItemIndicator, RadioGroupContext, RadioGroupItemContext } from "./primitives/radio-group/index.js";
export * from "./primitives/radio-group/RadioGroupParts.js";
export { RadioGroupRootProvider, useRadioGroup } from "./primitives/radio-group/RadioGroupRoot.js";
export type { RadioGroupRootProviderProps, RadioGroupController } from "./primitives/radio-group/RadioGroupRoot.js";

export {
  RadioGroupContextProvider,
  RadioGroupRoot,
  RadioRoot,
  RadioGroupIndicator,
  useRadioGroupContext,
} from "./primitives/radio-group/index.js";
export type {
  RadioGroupContextValue,
  RadioGroupRootProps,
  RadioRootProps,
  RadioGroupIndicatorProps,
} from "./primitives/radio-group/index.js";

export const RadioGroup = {
  Root: RadioGroupRoot,
  Radio: RadioRoot,
  Indicator: RadioGroupIndicator,
  RootProvider: RadioGroupRootProvider,
  Label: RadioGroupLabel,
  ItemRoot: RadioGroupItemRoot,
  ItemHiddenInput: RadioGroupItemHiddenInput,
  ItemText: RadioGroupItemText,
  ItemControl: RadioGroupItemControl,
  ItemDescription: RadioGroupItemDescription,
  ItemIndicator: RadioGroupItemIndicator,
  Context: RadioGroupContext,
  ItemContext: RadioGroupItemContext,
} as const;
