"use client";

import { createContext, useContext, type RefObject } from "react";
import type { OTPFieldType } from "./utils.js";

export interface OTPFieldContextValue {
  value: string;
  chars: string[];
  length: number;
  type: OTPFieldType;
  mask: boolean | string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  inputMode: "numeric" | "text";
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  activeIndex: number;
  inputRegistryVersion: number;
  getInputIndex: (inputKey: string, providedIndex?: number) => number;
  getInputId: (index: number, providedId?: string) => string;
  getDisplayChar: (char: string) => string;
  registerInput: (inputKey: string) => void;
  unregisterInput: (inputKey: string) => void;
  setInputRef: (index: number, element: HTMLInputElement | null) => void;
  setActiveIndex: (index: number) => void;
  focusCell: (index: number) => void;
  updateCell: (index: number, char: string) => void;
  clearCell: (index: number) => void;
  clearPreviousCell: (index: number) => void;
  pasteValue: (value: string) => void;
}

const OTPFieldContext = createContext<OTPFieldContextValue | null>(null);
OTPFieldContext.displayName = "OTPFieldContext";

export const OTPFieldContextProvider = OTPFieldContext.Provider;

export function useOTPFieldContext(): OTPFieldContextValue {
  const context = useContext(OTPFieldContext);

  if (!context) {
    throw new Error("OTPField compound components must be used within <OTPFieldRoot>");
  }

  return context;
}
