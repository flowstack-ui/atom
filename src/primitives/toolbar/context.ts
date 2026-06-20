"use client";

import { createContext, useContext } from "react";

export type ToolbarOrientation = "horizontal" | "vertical";
export type ToolbarDirection = "ltr" | "rtl";

export interface ToolbarContextValue {
  /** Toolbar layout direction. */
  orientation: ToolbarOrientation;
  /** Text direction for arrow key mapping. */
  dir: ToolbarDirection;
  /** Whether arrow key focus wraps around. */
  loop: boolean;
  /** Register a focusable element for roving tabindex. */
  registerItem: (element: HTMLElement) => void;
  /** Unregister a focusable element. */
  unregisterItem: (element: HTMLElement) => void;
  /** Get all registered items sorted in DOM order. */
  getItems: () => HTMLElement[];
  /** Element that currently has tabIndex=0. */
  activeItem: HTMLElement | null;
  /** Set the element that currently has tabIndex=0. */
  setActiveItem: (element: HTMLElement | null) => void;
  /** Version tick updated when item registration changes. */
  registeredVersion: number;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);
ToolbarContext.displayName = "ToolbarContext";

export const ToolbarContextProvider = ToolbarContext.Provider;

export function useToolbarContext(): ToolbarContextValue {
  const ctx = useContext(ToolbarContext);
  if (!ctx) {
    throw new Error("Toolbar compounds must be used within <ToolbarRoot>");
  }
  return ctx;
}
