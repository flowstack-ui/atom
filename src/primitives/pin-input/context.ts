"use client";

import {
  createContext,
  useContext,
  type FormEvent,
  type RefObject,
} from "react";
import type { PinInputType } from "./utils.js";
import type { ValidationBehavior } from "../form/validation.js";
import type { PinInputController } from "./PinInputRoot.js";

export interface PinInputContextValue {
  controller: PinInputController;
  value: string[];
  otp: boolean;
  selectOnFocus: boolean;
  placeholder: string;
  dir: "ltr" | "rtl";
  describedBy: string | undefined;
  labelId: string;
  setLabelMounted: (mounted: boolean) => void;
  setFocusedIndex: (index: number) => void;
  chars: string[];
  length: number;
  type: PinInputType;
  mask: boolean | string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  form: string | undefined;
  inputMode: "numeric" | "text";
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  activeIndex: number;
  inputRegistryVersion: number;
  getInputIndex: (inputKey: string, providedIndex?: number) => number;
  getInputId: (index: number, providedId?: string) => string;
  getDisplayChar: (char: string) => string;
  getInputLabel: (index: number) => string;
  registerInput: (inputKey: string) => void;
  unregisterInput: (inputKey: string) => void;
  setInputRef: (index: number, element: HTMLInputElement | null) => void;
  setActiveIndex: (index: number) => void;
  focusCell: (index: number) => void;
  updateCell: (index: number, char: string) => void;
  clearCell: (index: number) => void;
  clearPreviousCell: (index: number) => void;
  pasteValue: (value: string, index?: number) => void;
  validationBehavior: ValidationBehavior;
  onValidationInvalid: (event: FormEvent<HTMLInputElement>) => void;
  syncValidation: () => void;
}

const PinInputContext = createContext<PinInputContextValue | null>(null);
PinInputContext.displayName = "PinInputContext";

export const PinInputContextProvider = PinInputContext.Provider;

export function usePinInputInternalContext(): PinInputContextValue {
  const context = useContext(PinInputContext);

  if (!context) {
    throw new Error(
      "PinInput compound components must be used within <PinInputRoot>",
    );
  }

  return context;
}

export function usePinInputContext(): PinInputController {
  return usePinInputInternalContext().controller;
}
