"use client";

import { forwardRef } from "react";
import { CheckboxRoot, type CheckboxRootProps } from "./CheckboxRoot.js";
import type { CheckboxController } from "./useCheckbox.js";

export type CheckboxRootProviderProps = Omit<CheckboxRootProps, "checked" | "defaultChecked" | "onCheckedChange" | "value"> & {
  value: CheckboxController;
  /** Native submitted value; value is reserved for the controller on this part. */
  inputValue?: string;
};
export const CheckboxRootProvider = forwardRef<HTMLButtonElement, CheckboxRootProviderProps>(function CheckboxRootProvider({ value, inputValue, disabled, readOnly, ...props }, ref) {
  return <CheckboxRoot {...props} ref={ref} value={inputValue} checked={value.checked} onCheckedChange={value.setChecked} disabled={disabled || value.disabled} readOnly={readOnly || value.readOnly} />;
});
