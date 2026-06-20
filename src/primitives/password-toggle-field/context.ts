"use client";

import { createContext, useContext } from "react";

export interface PasswordToggleFieldContextValue {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onToggle: () => void;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
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
