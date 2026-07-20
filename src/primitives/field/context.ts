"use client";

import { createContext, useContext } from "react";

export type FieldOrientation = "vertical" | "horizontal";

export interface FieldContextValue {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  describedBy: string | undefined;
  hasDescription: boolean;
  hasError: boolean;
  registerPart: (kind: "description" | "error") => () => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);
FieldContext.displayName = "FieldContext";

export const FieldContextProvider = FieldContext.Provider;

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export function useRequiredFieldContext(): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("Field compound components must be used within <Field.Root>");
  }
  return ctx;
}
