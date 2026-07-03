"use client";

import { createContext, useContext } from "react";

export interface ToggleGroupContextValue {
  /** Selection mode. */
  type: "single" | "multiple";
  /** Selected values normalized to an array. */
  value: string[];
  /** Registered item values in render order. */
  registeredValues: string[];
  /** Handle item press. */
  onItemPress: (itemValue: string) => void;
  /** Group-level disabled state. */
  disabled: boolean;
  /** Keyboard navigation orientation. */
  orientation: "horizontal" | "vertical";
  /** Arrow-key wrapping. */
  loop: boolean;
  /** Register an item element for roving tabindex. */
  registerItem: (value: string, element: HTMLElement, disabled?: boolean) => void;
  /** Unregister an item element. */
  unregisterItem: (value: string) => void;
  /** Get a registered item element by value. */
  getItemElement: (value: string) => HTMLElement | null;
  /** Check whether a registered item is disabled. */
  isItemDisabled: (value: string) => boolean;
  /** Get registered item values in DOM order. */
  getItemValues: () => string[];
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);
ToggleGroupContext.displayName = "ToggleGroupContext";

export const ToggleGroupContextProvider = ToggleGroupContext.Provider;

export function useToggleGroupContext(): ToggleGroupContextValue {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroup primitives must be used within a <ToggleGroupRoot>.");
  }

  return context;
}
