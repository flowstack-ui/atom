"use client";
import type { ReactNode } from "react";
import { useRequiredFieldContext, type FieldContextValue } from "./context.js";
export interface FieldContextProps { children: (context: FieldContextValue) => ReactNode }
export function FieldContext({ children }: FieldContextProps) {
  return children(useRequiredFieldContext());
}
