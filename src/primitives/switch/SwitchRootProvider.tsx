"use client";

import { forwardRef } from "react";
import {
  SwitchFieldImplementation,
  type SwitchFieldProps,
} from "./SwitchField.js";
import type { SwitchController } from "./useSwitch.js";

export type SwitchRootProviderProps = Omit<
  SwitchFieldProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
  value: SwitchController;
  /** Native submitted value; value is reserved for the controller on this part. */
  inputValue?: string;
};

export const SwitchRootProvider = forwardRef<
  HTMLDivElement,
  SwitchRootProviderProps
>(function SwitchRootProvider(
  { value, inputValue, disabled, readOnly, ...props },
  ref,
) {
  return (
    <SwitchFieldImplementation
      {...props}
      ref={ref}
      controller={value}
      value={inputValue}
      disabled={Boolean(disabled || value.disabled)}
      readOnly={Boolean(readOnly || value.readOnly)}
    />
  );
});
