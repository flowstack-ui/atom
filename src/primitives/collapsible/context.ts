"use client";

import { createContext, useContext } from "react";

export interface CollapsibleContextValue {
  /** Whether content is currently visible. */
  isOpen: boolean;
  /** Toggle open state. */
  onToggle: () => void;
  /** Open content. */
  onOpen: () => void;
  /** Close content. */
  onClose: () => void;
  /** Unique ID for the content panel. */
  contentId: string;
  /** Unique ID for the trigger. */
  triggerId: string;
  /** Whether interaction is disabled. */
  disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);
CollapsibleContext.displayName = "CollapsibleContext";

export const CollapsibleContextProvider = CollapsibleContext.Provider;

export function useCollapsibleContext(): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error("Collapsible compound components must be used within <CollapsibleRoot>.");
  }

  return context;
}
