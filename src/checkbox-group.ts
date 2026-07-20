"use client";

import {
  CheckboxGroupItem,
  CheckboxGroupItemDescription,
  CheckboxGroupItemLabel,
  CheckboxGroupParent,
  CheckboxGroupRoot,
} from "./primitives/checkbox-group/index.js";

export {
  CheckboxGroupItem,
  CheckboxGroupItemDescription,
  CheckboxGroupItemLabel,
  CheckboxGroupItemContextProvider,
  CheckboxGroupParent,
  CheckboxGroupContextProvider,
  CheckboxGroupRoot,
  getCheckboxGroupItemPartPresence,
  markCheckboxGroupItemPart,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from "./primitives/checkbox-group/index.js";
export type {
  CheckboxGroupContextValue,
  CheckboxGroupItemContextValue,
  CheckboxGroupItemDescriptionProps,
  CheckboxGroupItemLabelProps,
  CheckboxGroupItemPartKind,
  CheckboxGroupItemPartPresence,
  CheckboxGroupItemProps,
  CheckboxGroupParentProps,
  CheckboxGroupRootProps,
} from "./primitives/checkbox-group/index.js";

export const CheckboxGroup = {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
  ItemLabel: CheckboxGroupItemLabel,
  ItemDescription: CheckboxGroupItemDescription,
  Parent: CheckboxGroupParent,
} as const;
