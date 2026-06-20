"use client";

import { createContext, useContext, type ReactNode } from "react";

export type DirectionValue = "ltr" | "rtl";

export interface DirectionProviderProps {
  /** Descendant tree that receives direction context. */
  children: ReactNode;
  /** Direction for behavior that must mirror in RTL. @default "ltr" */
  dir?: DirectionValue;
}

export const defaultDirection: DirectionValue = "ltr";

const DirectionContext = createContext<DirectionValue>(defaultDirection);
DirectionContext.displayName = "DirectionContext";

export function DirectionProvider({
  children,
  dir = defaultDirection,
}: DirectionProviderProps) {
  return (
    <DirectionContext.Provider value={dir}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionValue {
  return useContext(DirectionContext);
}
