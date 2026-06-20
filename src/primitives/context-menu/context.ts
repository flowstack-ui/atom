"use client";

import { createContext, useContext } from "react";

export interface ContextMenuAnchorPoint {
  x: number;
  y: number;
}

export interface ContextMenuContextValue {
  anchorPoint: ContextMenuAnchorPoint | null;
  setAnchorPoint: (point: ContextMenuAnchorPoint | null) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
ContextMenuContext.displayName = "ContextMenuContext";

export const ContextMenuContextProvider = ContextMenuContext.Provider;

export function useContextMenuContext(): ContextMenuContextValue {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error("ContextMenu compounds must be used within <ContextMenuRoot>");
  }
  return ctx;
}
