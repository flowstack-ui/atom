"use client";

import { createContext, useContext } from "react";

export interface CheckboxGroupContextValue {
  /** Currently selected values. */
  groupValues: string[];
  /** Registered item values, used for parent tri-state computation. */
  allItemValues: string[];
  /** Toggle a single item on or off. */
  toggleItem: (value: string) => void;
  /** Select all or deselect all registered items. */
  toggleAll: (checked: boolean) => void;
  /** Check if a specific item is selected. */
  isItemChecked: (value: string) => boolean;
  /** Register an item value on mount. */
  registerItem: (value: string) => void;
  /** Unregister an item value on unmount. */
  unregisterItem: (value: string) => void;
  /** Form field name shared across checkboxes. */
  name: string | undefined;
  /** Form owner ID shared across checkbox item hidden inputs. */
  form: string | undefined;
  /** Group-level disabled state. */
  disabled: boolean;
  /** Group-level required state. */
  required: boolean;
  /** Group-level read-only state. */
  readOnly: boolean;
  /** Group-level invalid state. */
  invalid: boolean;
  /** Layout orientation. */
  orientation: "horizontal" | "vertical";
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);
CheckboxGroupContext.displayName = "CheckboxGroupContext";

export const CheckboxGroupContextProvider = CheckboxGroupContext.Provider;

export function useCheckboxGroupContext(): CheckboxGroupContextValue {
  const context = useContext(CheckboxGroupContext);

  if (!context) {
    throw new Error("CheckboxGroup items must be used within a <CheckboxGroupRoot>.");
  }

  return context;
}
