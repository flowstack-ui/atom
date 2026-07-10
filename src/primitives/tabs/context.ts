"use client";

import { createContext, useContext } from "react";
import type { DirectionValue } from "../direction/index.js";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface TabsContextValue {
  /** Currently active tab value. */
  activeValue: string;
  /** Registered trigger values in render order. */
  registeredValues: string[];
  /** Set the active tab value. */
  setActiveValue: (value: string) => void;
  /** Unique ID prefix for ARIA wiring. */
  idPrefix: string;
  /** Tab orientation. */
  orientation: TabsOrientation;
  /** Text direction for horizontal keyboard navigation. */
  dir: DirectionValue;
  /** Focus activation behavior. */
  activationMode: TabsActivationMode;
  /** Whether arrow keys wrap. */
  loop: boolean;
  /** Register a tab trigger element for roving tabindex ordering. */
  registerTrigger: (value: string, element: HTMLButtonElement) => void;
  /** Unregister a tab trigger element. */
  unregisterTrigger: (value: string) => void;
  /** Get the trigger element for a value. */
  getTriggerElement: (value: string) => HTMLButtonElement | null;
  /** Get registered trigger values in DOM order. */
  getTriggerValues: () => string[];
}

const TabsContext = createContext<TabsContextValue | null>(null);
TabsContext.displayName = "TabsContext";

export const TabsContextProvider = TabsContext.Provider;

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs compound components must be used within <TabsRoot>.");
  }

  return context;
}
