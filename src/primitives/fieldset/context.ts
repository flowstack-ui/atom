"use client";

import { createContext, useContext } from "react";
import type { ValidationBehavior } from "../form/validation.js";

export interface FieldsetContextValue {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  legendId: string;
  descriptionId: string;
  errorId: string;
  describedBy: string | undefined;
  hasDescription: boolean;
  hasError: boolean;
  hasLegend: boolean;
  validationBehavior?: ValidationBehavior;
  reportControlValidity?: (id: string, invalid: boolean) => void;
  registerPart: (kind: "legend" | "description" | "error") => () => void;
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
