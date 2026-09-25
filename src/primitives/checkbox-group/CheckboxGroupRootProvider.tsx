"use client";

import { forwardRef } from "react";
import { CheckboxGroupRoot, type CheckboxGroupRootProps } from "./CheckboxGroupRoot.js";
import type { CheckboxGroupController } from "./useCheckboxGroup.js";

export type CheckboxGroupRootProviderProps = Omit<CheckboxGroupRootProps, "value" | "defaultValue" | "onValueChange" | "maxSelectedValues"> & { value: CheckboxGroupController };
export const CheckboxGroupRootProvider = forwardRef<HTMLDivElement, CheckboxGroupRootProviderProps>(function CheckboxGroupRootProvider({ value, disabled, readOnly, ...props }, ref) {
  return <CheckboxGroupRoot {...props} ref={ref} value={value.value} onValueChange={value.setValue} disabled={disabled || value.disabled} readOnly={readOnly || value.readOnly} maxSelectedValues={value.maxSelectedValues} />;
});
