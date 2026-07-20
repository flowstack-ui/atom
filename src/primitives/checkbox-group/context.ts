"use client";

import { createContext, useContext } from "react";

export interface CheckboxGroupContextValue {
  /** Currently selected values. */
  groupValues: string[];
  /** Mounted item values retained for compatible custom aggregate controls. */
  allItemValues: string[];
  /** Explicit complete value set used by deterministic aggregate controls. */
  allValues: string[] | undefined;
  /** Toggle a single item on or off. */
  toggleItem: (value: string) => void;
  /** Select or clear the explicit value set, falling back to mounted items. */
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

export type CheckboxGroupItemPartKind = "label" | "description";

export interface CheckboxGroupItemContextValue {
  labelId: string;
  descriptionId: string;
  hasLabel: boolean;
  hasDescription: boolean;
  registerPart: (kind: CheckboxGroupItemPartKind) => () => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);
CheckboxGroupContext.displayName = "CheckboxGroupContext";

export const CheckboxGroupContextProvider = CheckboxGroupContext.Provider;

const CheckboxGroupItemContext = createContext<CheckboxGroupItemContextValue | null>(null);
CheckboxGroupItemContext.displayName = "CheckboxGroupItemContext";

export const CheckboxGroupItemContextProvider = CheckboxGroupItemContext.Provider;

export function useCheckboxGroupContext(): CheckboxGroupContextValue {
  const context = useContext(CheckboxGroupContext);

  if (!context) {
    throw new Error("CheckboxGroup items must be used within a <CheckboxGroupRoot>.");
  }

  return context;
}

export function useCheckboxGroupItemContext(): CheckboxGroupItemContextValue {
  const context = useContext(CheckboxGroupItemContext);

  if (!context) {
    throw new Error(
      "CheckboxGroup item parts must be used within a <CheckboxGroupItem>.",
    );
  }

  return context;
}
