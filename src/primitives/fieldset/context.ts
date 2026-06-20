"use client";

import { createContext, useContext } from "react";

export interface FieldsetContextValue {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  descriptionId: string;
  errorId: string;
  describedBy: string | undefined;
  hasDescription: boolean;
  hasError: boolean;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;
}

const FieldsetContext = createContext<FieldsetContextValue | null>(null);
FieldsetContext.displayName = "FieldsetContext";

export const FieldsetContextProvider = FieldsetContext.Provider;

export function useFieldsetContext(): FieldsetContextValue | null {
  return useContext(FieldsetContext);
}

export function useRequiredFieldsetContext(): FieldsetContextValue {
  const ctx = useContext(FieldsetContext);
  if (!ctx) {
    throw new Error("Fieldset compound components must be used within <Fieldset.Root>");
  }
  return ctx;
}
