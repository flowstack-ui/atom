"use client";

import { createContext, useContext } from "react";
import type { DirectionValue } from "../direction/index.js";

export interface MenubarContextValue {
  openValue: string | null;
  onMenuOpen: (value: string) => void;
  onMenuClose: () => void;
  isAnyOpen: boolean;
  registerTrigger: (value: string, element: HTMLElement) => void;
  unregisterTrigger: (value: string) => void;
  getTriggerValues: () => string[];
  getTriggerElement: (value: string) => HTMLElement | undefined;
  focusAdjacentTrigger: (
    currentValue: string,
    direction: "prev" | "next",
  ) => void;
  openAdjacentMenu: (
    currentValue: string,
    direction: "prev" | "next",
  ) => void;
  focusedValue: string | null;
  onFocus: (value: string) => void;
  loop: boolean;
  dir: DirectionValue;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);
MenubarContext.displayName = "MenubarContext";

export const MenubarContextProvider = MenubarContext.Provider;

export function useMenubarContext(): MenubarContextValue {
  const ctx = useContext(MenubarContext);
  if (!ctx) {
    throw new Error("Menubar compounds must be used within a Menubar.Root");
  }
  return ctx;
}

export interface MenubarMenuContextValue {
  menuValue: string;
}

const MenubarMenuContext = createContext<MenubarMenuContextValue | null>(null);
MenubarMenuContext.displayName = "MenubarMenuContext";

export const MenubarMenuContextProvider = MenubarMenuContext.Provider;

export function useMenubarMenuContext(): MenubarMenuContextValue {
  const ctx = useContext(MenubarMenuContext);
  if (!ctx) {
    throw new Error(
      "Menubar.Trigger and Menubar.Content must be used within a Menubar.Menu",
    );
  }
  return ctx;
}
