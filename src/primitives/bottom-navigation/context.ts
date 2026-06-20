"use client";

import { createContext, useContext } from "react";

export interface BottomNavigationContextValue {
  /** Active destination value. */
  value: string | null;
  /** Select a destination value. */
  onChange: (value: string) => void;
  /** Show all labels or only the active item's label. */
  showLabels: boolean;
}

const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);
BottomNavigationContext.displayName = "BottomNavigationContext";

export const BottomNavigationContextProvider = BottomNavigationContext.Provider;

export function useBottomNavigationContext(): BottomNavigationContextValue {
  const ctx = useContext(BottomNavigationContext);
  if (!ctx) {
    throw new Error(
      "BottomNavigation compound components must be used within <BottomNavigationRoot>",
    );
  }
  return ctx;
}
