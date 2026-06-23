"use client";

import { createContext, useContext, type RefObject } from "react";

export type MenuInitialHighlight = "first" | "last";

export interface MenuContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  highlightedValue: string | null;
  onHighlight: (value: string | null) => void;
  initialHighlight: MenuInitialHighlight;
  onInitialHighlight: (value: MenuInitialHighlight) => void;
  registerItem: (value: string, element: HTMLElement) => void;
  unregisterItem: (value: string) => void;
  getItemElement: (value: string) => HTMLElement | undefined;
  getItemValues: () => string[];
  registerLabel: (value: string, label: string) => void;
  getLabel: (value: string) => string | undefined;
  onItemSelect: (value: string, options?: { closeOnSelect?: boolean }) => void;
  menuId: string;
  triggerId: string;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  modal: boolean;
  closeOnSelect: boolean;
  loop: boolean;
  openSubMenuId: string | null;
  onSubMenuOpen: (subMenuId: string) => void;
  onSubMenuClose: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);
MenuContext.displayName = "MenuContext";

export const MenuContextProvider = MenuContext.Provider;

export function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu compounds must be used within <MenuRoot>");
  return ctx;
}

export interface MenuRadioGroupContextValue {
  groupId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);
MenuRadioGroupContext.displayName = "MenuRadioGroupContext";

export const MenuRadioGroupContextProvider = MenuRadioGroupContext.Provider;

export function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const ctx = useContext(MenuRadioGroupContext);
  if (!ctx) throw new Error("MenuRadioItem must be used within <MenuRadioGroup>");
  return ctx;
}

export interface MenuSubContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  subMenuId: string;
  subTriggerId: string;
  subTriggerRef: RefObject<HTMLElement | null>;
  parentMenuContext: MenuContextValue;
}

const MenuSubContext = createContext<MenuSubContextValue | null>(null);
MenuSubContext.displayName = "MenuSubContext";

export const MenuSubContextProvider = MenuSubContext.Provider;

export function useMenuSubContext(): MenuSubContextValue | null {
  return useContext(MenuSubContext);
}
