"use client";

import { CheckboxIndicator, CheckboxRoot } from "./primitives/checkbox/index.js";

export {
  CheckboxContextProvider,
  CheckboxIndicator,
  CheckboxRoot,
  useCheckboxContext,
} from "./primitives/checkbox/index.js";
export type {
  CheckboxCheckedState,
  CheckboxContextValue,
  CheckboxDataState,
  CheckboxIndicatorProps,
  CheckboxRootProps,
} from "./primitives/checkbox/index.js";

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;
