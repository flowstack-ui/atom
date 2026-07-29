"use client";

import { createContext, useContext } from "react";
import type { ValidationBehavior } from "../form/validation.js";

export interface PasswordToggleFieldContextValue {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onToggle: () => void;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  inputId: string | undefined;
  ariaLabelledBy: string | undefined;
  ariaDescribedBy: string | undefined;
  showLabel: string;
  hideLabel: string;
  validationBehavior: ValidationBehavior | undefined;
  reportControlValidity: (id: string, invalid: boolean) => void;
  resetVisibility: () => void;
}

const PasswordToggleFieldContext =
  createContext<PasswordToggleFieldContextValue | null>(null);
PasswordToggleFieldContext.displayName = "PasswordToggleFieldContext";

export const PasswordToggleFieldContextProvider = PasswordToggleFieldContext.Provider;

export function usePasswordToggleFieldContext(): PasswordToggleFieldContextValue {
  const ctx = useContext(PasswordToggleFieldContext);
  if (!ctx) {
    throw new Error(
      "PasswordToggleField compounds must be used within <PasswordToggleField.Root>",
    );
  }
  return ctx;
}
