"use client";

import { createContext, useContext } from "react";

export interface TooltipTouchContextValue {
  onTouchLongPress: () => void;
  onTouchRelease: () => void;
  onTouchCancel: () => void;
}

const TooltipTouchContext = createContext<TooltipTouchContextValue | null>(null);
TooltipTouchContext.displayName = "TooltipTouchContext";

export const TooltipTouchContextProvider = TooltipTouchContext.Provider;

export function useTooltipTouchContext(): TooltipTouchContextValue {
  const context = useContext(TooltipTouchContext);
  if (!context) {
    throw new Error("Tooltip.Trigger must be used within <TooltipRoot>");
  }
  return context;
}
