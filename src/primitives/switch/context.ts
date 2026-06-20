"use client";

import { createContext, useContext } from "react";

export interface SwitchContextValue {
  /** Whether the switch is currently checked. */
  checked: boolean;
  /** Whether root interaction is disabled. */
  disabled: boolean;
  /** Whether root interaction is read-only. */
  readOnly: boolean;
  /** Whether the switch is marked invalid. */
  invalid: boolean;
  /** Whether the switch is marked required. */
  required: boolean;
}

const SwitchContext = createContext<SwitchContextValue | null>(null);
SwitchContext.displayName = "SwitchContext";

export const SwitchContextProvider = SwitchContext.Provider;

export function useSwitchContext(): SwitchContextValue {
  const context = useContext(SwitchContext);

  if (!context) {
    throw new Error("Switch compound components must be used within <SwitchRoot>.");
  }

  return context;
}
