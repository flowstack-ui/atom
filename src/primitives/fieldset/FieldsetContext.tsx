"use client";
import type { ReactNode } from "react";
import { useRequiredFieldsetContext, type FieldsetContextValue } from "./context.js";
export interface FieldsetContextProps { children: (context: FieldsetContextValue) => ReactNode }
export function FieldsetContext({ children }: FieldsetContextProps) {
  return children(useRequiredFieldsetContext());
}
