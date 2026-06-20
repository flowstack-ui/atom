"use client";

import { createContext, useContext, type RefObject } from "react";

export interface InputContextValue {
  value: string;
  setValue: (value: string) => void;
  clearValue: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  focused: boolean;
}

const InputContext = createContext<InputContextValue | null>(null);
InputContext.displayName = "InputContext";

export const InputContextProvider = InputContext.Provider;

export function useInputContext(): InputContextValue {
  const ctx = useContext(InputContext);
  if (!ctx) {
    throw new Error("Input compound components must be used within <Input.Root>");
  }
  return ctx;
}
