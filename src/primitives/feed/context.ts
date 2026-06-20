"use client";

import { createContext, useContext } from "react";

export type FeedSetSize = number | "unknown";

export interface FeedContextValue {
  busy: boolean;
  setSize?: FeedSetSize;
}

export const FeedContext = createContext<FeedContextValue | null>(null);
FeedContext.displayName = "FeedContext";

export const FeedContextProvider = FeedContext.Provider;

export function useFeedContext(): FeedContextValue {
  const context = useContext(FeedContext);

  if (!context) {
    throw new Error("Feed compound components must be used within <FeedRoot>.");
  }

  return context;
}

export function normalizeFeedPosition(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}

export function normalizeFeedSetSize(value: FeedSetSize | undefined): number | undefined {
  if (value === "unknown") return -1;
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}
