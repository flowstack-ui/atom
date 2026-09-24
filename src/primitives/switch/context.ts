"use client";

import {
  createContext,
  useContext,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import type { ValidationBehavior } from "../form/validation.js";

export type SwitchPartKind = "control" | "input" | "label";

export interface SwitchContextValue {
  /** Current checked state. */
  checked: boolean;
  /** Request a checked-state update from the owning controller. */
  setChecked: (checked: SetStateAction<boolean>) => void;
  /** Toggle through the owning controller when interaction is available. */
  toggle: () => void;
  /** Whether interaction and native submission are disabled. */
  disabled: boolean;
  /** Whether the switch is focusable but immutable. */
  readOnly: boolean;
  /** Whether the switch is invalid. */
  invalid: boolean;
  /** Whether the native checkbox is required. */
  required: boolean;
  /** Stable compound Control ID, when a compound owner supplies one. */
  controlId?: string;
  /** Stable compound Label ID, when a compound owner supplies one. */
  labelId?: string;
  /** Stable compound HiddenInput ID, when a compound owner supplies one. */
  inputId?: string;
}

export interface SwitchInternalContextValue extends SwitchContextValue {
  compound?: boolean;
  name?: string;
  inputValue?: string;
  form?: string;
  describedBy?: string;
  validationBehavior?: ValidationBehavior;
  controlled?: boolean;
  reset?: () => void;
  revealNativeInvalid?: () => void;
  validationProps?: {
    "data-atom-validation-owner": "";
    "data-atom-validation-behavior": ValidationBehavior;
    onInvalid: (event: FormEvent<HTMLInputElement>) => void;
    onInput: () => void;
    onChange: () => void;
  };
  controlRef?: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLInputElement | null>;
  registerPart?: (kind: SwitchPartKind) => () => void;
  registerPartId?: (kind: SwitchPartKind, id: string) => () => void;
}

const SwitchContext = createContext<SwitchInternalContextValue | null>(null);
SwitchContext.displayName = "SwitchContext";

export const SwitchContextProvider = SwitchContext.Provider;

export function useSwitchContext(): SwitchContextValue {
  return useSwitchInternalContext();
}

export function useSwitchInternalContext(): SwitchInternalContextValue {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error("Switch compound components must be used within a Switch owner.");
  }
  return context;
}
