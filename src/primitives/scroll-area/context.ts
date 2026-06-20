"use client";

import { createContext, useContext } from "react";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaContextValue {
  /** Scroll direction exposed to compound parts through data attributes. */
  orientation: ScrollAreaOrientation;
}

const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);
ScrollAreaContext.displayName = "ScrollAreaContext";

export const ScrollAreaContextProvider = ScrollAreaContext.Provider;

export function useScrollAreaContext(): ScrollAreaContextValue {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) {
    throw new Error(
      "ScrollArea compound components must be used within <ScrollAreaRoot>",
    );
  }
  return ctx;
}
