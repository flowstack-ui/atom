"use client";

import { createContext, useContext } from "react";

export type NavListOrientation = "horizontal" | "vertical";
export type NavListCurrentValue = boolean | "page" | "step" | "location" | "date" | "time";

export interface NavListContextValue {
  /** Visual orientation exposed to styled layers. Native link keyboard behavior is unchanged. */
  orientation: NavListOrientation;
}

export interface NavListSectionContextValue {
  /** Whether the section content is currently visible. */
  isOpen: boolean;
  /** Whether the section can be collapsed. */
  collapsible: boolean;
  /** Whether section interaction is disabled. */
  disabled: boolean;
  /** Stable ID for the section trigger. */
  triggerId: string;
  /** Stable ID for the section content. */
  contentId: string;
  /** Stable ID for the section label. */
  labelId: string;
  /** Whether a section label is currently mounted. */
  hasLabel: boolean;
  /** Register a mounted section label. */
  registerLabel: () => void;
  /** Unregister a mounted section label. */
  unregisterLabel: () => void;
  /** Set section open state. */
  setOpen: (open: boolean) => void;
  /** Toggle section open state. */
  toggle: () => void;
}

const NavListContext = createContext<NavListContextValue | null>(null);
NavListContext.displayName = "NavListContext";

const NavListSectionContext = createContext<NavListSectionContextValue | null>(null);
NavListSectionContext.displayName = "NavListSectionContext";

export const NavListContextProvider = NavListContext.Provider;
export const NavListSectionContextProvider = NavListSectionContext.Provider;

export function useNavListContext(): NavListContextValue {
  const context = useContext(NavListContext);

  if (!context) {
    throw new Error("NavList compound components must be used within <NavListRoot>.");
  }

  return context;
}

export function useNavListSectionContext(): NavListSectionContextValue {
  const context = useContext(NavListSectionContext);

  if (!context) {
    throw new Error("NavList section components must be used within <NavListSection>.");
  }

  return context;
}
