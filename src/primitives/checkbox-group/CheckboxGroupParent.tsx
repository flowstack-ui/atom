"use client";

import { forwardRef } from "react";
import {
  CheckboxRoot,
  type CheckboxRootProps,
} from "../checkbox/index.js";
import { useCheckboxGroupContext } from "./context.js";

export interface CheckboxGroupParentProps
  extends Omit<
    CheckboxRootProps,
    | "checked"
    | "defaultChecked"
    | "onCheckedChange"
    | "name"
    | "value"
    | "form"
    | "required"
  > {}

export const CheckboxGroupParent = forwardRef<
  HTMLButtonElement,
  CheckboxGroupParentProps
>(function CheckboxGroupParent(
  {
    disabled = false,
    readOnly = false,
    invalid = false,
    "data-slot": dataSlot = "checkbox-group-parent",
    ...restProps
  },
  ref,
) {
  const context = useCheckboxGroupContext();

  if (context.allValues === undefined) {
    throw new Error(
      "CheckboxGroup.Parent requires <CheckboxGroup.Root allValues={...}> for deterministic aggregate state.",
    );
  }

  const selectedCount = context.allValues.filter((value) =>
    context.groupValues.includes(value),
  ).length;
  const allChecked =
    context.allValues.length > 0 && selectedCount === context.allValues.length;
  const someChecked = selectedCount > 0 && !allChecked;
  const checked = someChecked ? "indeterminate" : allChecked;

  return (
    <CheckboxRoot
      {...restProps}
      ref={ref}
      checked={checked}
      onCheckedChange={(nextChecked) => {
        context.toggleAll(nextChecked === true);
      }}
      disabled={disabled || context.disabled}
      readOnly={readOnly || context.readOnly}
      invalid={invalid || context.invalid}
      data-slot={dataSlot}
    />
  );
});
