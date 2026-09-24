"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { UseCollapsibleReturn } from "./controller.js";
export type CollapsibleContextValue = UseCollapsibleReturn;
const OwnerContext = createContext<CollapsibleContextValue | null>(null);
OwnerContext.displayName = "OwnerContext";
export const CollapsibleContextProvider = OwnerContext.Provider;
export function useCollapsibleContext(): CollapsibleContextValue {
  const value = useContext(OwnerContext);
  if (!value)
    throw new Error(
      "Collapsible compound components must be used within <CollapsibleRoot>.",
    );
  return value;
}
export function CollapsibleContext({
  children,
}: {
  children: (value: CollapsibleContextValue) => ReactNode;
}) {
  return children(useCollapsibleContext());
}
