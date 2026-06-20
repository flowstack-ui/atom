"use client";

import { createContext, useContext } from "react";
import type { ProgressState } from "./utils.js";

export interface ProgressContextValue extends ProgressState {}

const ProgressContext = createContext<ProgressContextValue | null>(null);
ProgressContext.displayName = "ProgressContext";

export const ProgressContextProvider = ProgressContext.Provider;

export function useProgressContext(): ProgressContextValue {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("Progress compound components must be used within <ProgressRoot>.");
  }

  return context;
}
