"use client";

import {
  createContext,
  useContext,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { DirectionValue } from "../direction/index.js";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  clearValue: () => void;
  focusedValue: string;
  setFocusedValue: (value: string) => void;
  focus: (value: string) => void;
  select: (value: string, node?: HTMLElement) => void;
  getId: (
    part: "root" | "list" | "trigger" | "content" | "indicator",
    value?: string,
  ) => string;
  listRef: MutableRefObject<HTMLElement | null>;
  indicatorReady: boolean;
  setIndicatorReady: (ready: boolean) => void;
  collectionVersion: number;
  composite: boolean;
  hasNavigate: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  hideMode: "display-none" | "activity";
  onExitComplete?: () => void;
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

const InternalTabsContext = createContext<TabsContextValue | null>(null);
InternalTabsContext.displayName = "TabsContext";

export const TabsContextProvider = InternalTabsContext.Provider;

export function useTabsContext(): TabsContextValue {
  const context = useContext(InternalTabsContext);

  if (!context) {
    throw new Error("Tabs compound components must be used within <TabsRoot>.");
  }

  return context;
}

export function TabsContext({
  children,
}: {
  children: (context: TabsContextValue) => ReactNode;
}) {
  return children(useTabsContext());
}
