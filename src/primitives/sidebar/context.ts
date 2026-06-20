"use client";

import { createContext, useContext } from "react";

export type SidebarState = "expanded" | "rail" | "offcanvas";
export type SidebarCollapsedState = Exclude<SidebarState, "expanded">;
export type SidebarSide = "left" | "right";

export interface SidebarContextValue {
  /** Current sidebar state. */
  state: SidebarState;
  /** State used by the default toggle when leaving expanded mode. */
  collapsedState: SidebarCollapsedState;
  /** Side of the viewport or layout where the sidebar is placed. */
  side: SidebarSide;
  /** Whether sidebar controls are disabled. */
  disabled: boolean;
  /** Stable panel id used by triggers. */
  panelId: string;
  /** Stable trigger id. */
  triggerId: string;
  /** Set the sidebar state. */
  setState: (state: SidebarState) => void;
  /** Toggle between expanded and collapsedState. */
  toggle: () => void;
  /** Set state to expanded. */
  expand: () => void;
  /** Set state to the configured collapsedState. */
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);
SidebarContext.displayName = "SidebarContext";

export const SidebarContextProvider = SidebarContext.Provider;

export function useSidebarContext(): SidebarContextValue {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar compound components must be used within <SidebarRoot>.");
  }

  return context;
}
