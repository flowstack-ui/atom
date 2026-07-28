"use client";

import { createContext, useContext, type ChangeEvent, type FocusEvent, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import type { ValidationBehavior } from "../form/validation.js";

export interface NumberInputContextValue {
  numericValue: number | null;
  displayValue: string;
  min: number | undefined;
  max: number | undefined;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  inputId: string | undefined;
  inputRef: RefObject<HTMLInputElement | null>;
  inputMode: "decimal";
  placeholder: string | undefined;
  form: string | undefined;
  inputClassName: string | undefined;
  ariaLabel: string | undefined;
  ariaValueText: string | undefined;
  ariaDescribedBy: string | undefined;
  validationBehavior: ValidationBehavior;
  isAtMin: boolean;
  isAtMax: boolean;
  handleStep: (direction: 1 | -1, stepSize?: number) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleInput: () => void;
  handleInvalid: (event: FormEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleFocus: (event: FocusEvent<HTMLInputElement>) => void;
  handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
}

const NumberInputContext = createContext<NumberInputContextValue | null>(null);
NumberInputContext.displayName = "NumberInputContext";

export const NumberInputContextProvider = NumberInputContext.Provider;

export function useNumberInputContext(): NumberInputContextValue {
  const context = useContext(NumberInputContext);
  if (!context) {
    throw new Error("NumberInput compound parts must be used within <NumberInput.Root>");
  }
  return context;
}
