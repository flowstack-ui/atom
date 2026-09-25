"use client";

import { CheckboxIndicator, CheckboxRoot, CheckboxRootProvider } from "./primitives/checkbox/index.js";
export { useCheckbox, CheckboxRootProvider } from "./primitives/checkbox/index.js";
export type { UseCheckboxProps, CheckboxController, CheckboxRootProviderProps } from "./primitives/checkbox/index.js";

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
  RootProvider: CheckboxRootProvider,
  Indicator: CheckboxIndicator,
} as const;
