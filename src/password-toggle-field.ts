"use client";

import {
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldRoot,
  PasswordToggleFieldToggle,
} from "./primitives/password-toggle-field/index.js";

export {
  PasswordToggleFieldContextProvider,
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldRoot,
  PasswordToggleFieldToggle,
  usePasswordToggleFieldContext,
} from "./primitives/password-toggle-field/index.js";
export type {
  PasswordToggleFieldContextValue,
  PasswordToggleFieldIconProps,
  PasswordToggleFieldInputProps,
  PasswordToggleFieldRootProps,
  PasswordToggleFieldToggleProps,
} from "./primitives/password-toggle-field/index.js";

export const PasswordToggleField = {
  Root: PasswordToggleFieldRoot,
  Input: PasswordToggleFieldInput,
  Toggle: PasswordToggleFieldToggle,
  Icon: PasswordToggleFieldIcon,
} as const;
