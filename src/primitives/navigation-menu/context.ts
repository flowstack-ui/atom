"use client";

import { createContext, useContext, type ReactNode, type RefObject } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import type { DirectionValue } from "../direction/index.js";

export interface ContentNodeEntry {
  node: ReactNode;
  asChild?: boolean;
  className?: string;
  dataSlot?: string;
  loop?: boolean;
  props?: NativeDivProps<"children">;
  render?: RenderProp;
}

export type NavigationMenuControlType = "trigger" | "link";

export interface NavigationMenuContextValue {
  value: string | null;
  onValueChange: (value: string | null) => void;
  previousValue: string | null;
  delayDuration: number;
  skipDelayDuration: number;
  isSkipDelayActive: boolean;
  orientation: "horizontal" | "vertical";
  dir: DirectionValue;
  loop: boolean;
  registerItem: (value: string) => void;
  unregisterItem: (value: string) => void;
  getItemValues: () => string[];
  registerTrigger: (value: string, element: HTMLButtonElement) => void;
  registerLink: (value: string, element: HTMLAnchorElement) => void;
  unregisterTrigger: (value: string) => void;
  unregisterLink: (value: string) => void;
  getTriggerElement: (value: string) => HTMLButtonElement | null;
  getControlElement: (value: string) => HTMLElement | null;
  getControlType: (value: string) => NavigationMenuControlType | null;
  getNextTriggerValue: (
    value: string,
    direction: "next" | "previous",
  ) => string | null;
  getFirstTriggerValue: () => string | null;
  getLastTriggerValue: () => string | null;
  registerContentNode: (value: string, entry: ContentNodeEntry) => void;
  unregisterContentNode: (value: string) => void;
  getContentNode: (value: string) => ContentNodeEntry | null;
  startCloseTimer: () => void;
  cancelCloseTimer: () => void;
  rootRef: RefObject<HTMLElement | null>;
  idPrefix: string;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);
NavigationMenuContext.displayName = "NavigationMenuContext";

export const NavigationMenuContextProvider = NavigationMenuContext.Provider;

export function useNavigationMenuContext(): NavigationMenuContextValue {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error(
      "NavigationMenu compounds must be used within a NavigationMenu.Root",
    );
  }
  return ctx;
}

export interface NavigationMenuItemContextValue {
  value: string;
}

const NavigationMenuItemContext =
  createContext<NavigationMenuItemContextValue | null>(null);
NavigationMenuItemContext.displayName = "NavigationMenuItemContext";

export const NavigationMenuItemContextProvider = NavigationMenuItemContext.Provider;

export function useNavigationMenuItemContext(): NavigationMenuItemContextValue {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error(
      "NavigationMenu.Trigger/Content must be used within a NavigationMenu.Item",
    );
  }
  return ctx;
}

export function useOptionalNavigationMenuItemContext(): NavigationMenuItemContextValue | null {
  return useContext(NavigationMenuItemContext);
}
