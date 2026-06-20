"use client";

import { CheckboxGroupItem, CheckboxGroupRoot } from "./primitives/checkbox-group/index.js";

export {
  CheckboxGroupItem,
  CheckboxGroupContextProvider,
  CheckboxGroupRoot,
  useCheckboxGroupContext,
} from "./primitives/checkbox-group/index.js";
export type {
  CheckboxGroupContextValue,
  CheckboxGroupItemProps,
  CheckboxGroupRootProps,
} from "./primitives/checkbox-group/index.js";

export const CheckboxGroup = {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
} as const;
