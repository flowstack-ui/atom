"use client";

import { createContext, useContext } from "react";

export type CheckboxCheckedState = boolean | "indeterminate";
export type CheckboxDataState = "checked" | "unchecked" | "indeterminate";

export interface CheckboxContextValue {
  /** Current visual/ARIA state for the checkbox. */
  state: CheckboxDataState;
  /** Whether root interaction is disabled. */
  disabled: boolean;
}

const CheckboxContext = createContext<CheckboxContextValue | null>(null);
CheckboxContext.displayName = "CheckboxContext";

export const CheckboxContextProvider = CheckboxContext.Provider;

export function useCheckboxContext(): CheckboxContextValue {
  const context = useContext(CheckboxContext);

  if (!context) {
    throw new Error("Checkbox compound components must be used within <CheckboxRoot>.");
  }

  return context;
}
