"use client";

import { createContext, useContext } from "react";
import type { ValidationBehavior } from "./validation.js";

export interface FormContextValue {
  submitting: boolean;
  submitted: boolean;
  invalid: boolean;
  validationBehavior?: ValidationBehavior;
  reportControlValidity?: (id: string, invalid: boolean) => void;
}

const FormContext = createContext<FormContextValue | null>(null);
FormContext.displayName = "FormContext";

export const FormContextProvider = FormContext.Provider;

export function useOptionalFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("Form compound components must be used within <Form.Root>.");
  }

  return context;
}
