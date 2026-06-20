"use client";

import { createContext, useContext } from "react";

export interface FormContextValue {
  submitting: boolean;
  submitted: boolean;
  invalid: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);
FormContext.displayName = "FormContext";

export const FormContextProvider = FormContext.Provider;

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("Form compound components must be used within <Form.Root>.");
  }

  return context;
}
