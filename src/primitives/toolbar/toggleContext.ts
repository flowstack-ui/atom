"use client";

import { createContext, useContext } from "react";

export type ToolbarToggleType = "single" | "multiple";

export interface ToolbarToggleContextValue {
  /** Selection mode. */
  type: ToolbarToggleType;
  /** Currently selected values. */
  value: string[];
  /** Handle toggle press. */
  onItemPress: (itemValue: string) => void;
  /** Group-level disabled state. */
  disabled: boolean;
}

const ToolbarToggleContext = createContext<ToolbarToggleContextValue | null>(null);
ToolbarToggleContext.displayName = "ToolbarToggleContext";

export const ToolbarToggleContextProvider = ToolbarToggleContext.Provider;

export function useToolbarToggleContext(): ToolbarToggleContextValue {
  const ctx = useContext(ToolbarToggleContext);
  if (!ctx) {
    throw new Error("ToolbarToggleItem must be used within <ToolbarToggleGroup>");
  }
  return ctx;
}
