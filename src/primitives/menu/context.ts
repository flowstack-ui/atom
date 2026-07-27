"use client";

import { createContext, useContext, type RefObject } from "react";
import type { DirectionValue } from "../direction/index.js";
import type { FocusScope } from "../../hooks/focus.js";
import type { ModalLayer } from "../modal/layer.js";

export type MenuInitialHighlight = "first" | "last" | null;
export type MenuCloseReason =
  | "escape"
  | "select"
  | "tab"
  | "interactOutside"
  | "programmatic";

export interface MenuContentContextValue {
  arrowRef: RefObject<SVGSVGElement | null>;
  side: "top" | "right" | "bottom" | "left";
  align: "start" | "center" | "end";
  arrowX?: number;
  arrowY?: number;
}

const MenuContentContext = createContext<MenuContentContextValue | null>(null);
MenuContentContext.displayName = "MenuContentContext";
export const MenuContentContextProvider = MenuContentContext.Provider;
export function useMenuContentContext(): MenuContentContextValue {
  const context = useContext(MenuContentContext);
  if (!context) throw new Error("MenuArrow must be used within <MenuContent>");
  return context;
}

export interface MenuPortalContextValue {
  container?: HTMLElement | null;
  disabled?: boolean;
}
const MenuPortalContext = createContext<MenuPortalContextValue | null>(null);
MenuPortalContext.displayName = "MenuPortalContext";
export const MenuPortalContextProvider = MenuPortalContext.Provider;
export function useMenuPortalContext(): MenuPortalContextValue | null {
  return useContext(MenuPortalContext);
}

export function getMenuSubmenuOpenKey(dir: DirectionValue): "ArrowLeft" | "ArrowRight" {
  return dir === "rtl" ? "ArrowLeft" : "ArrowRight";
}

export function getMenuSubmenuCloseKey(dir: DirectionValue): "ArrowLeft" | "ArrowRight" {
  return dir === "rtl" ? "ArrowRight" : "ArrowLeft";
}

export interface MenuContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: (reason?: MenuCloseReason, finalFocus?: HTMLElement | null) => void;
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
  ownerBoundaryRef: RefObject<HTMLElement | null>;
  focusOriginRef: RefObject<HTMLElement | null>;
  modalLayer: ModalLayer;
  focusScope: FocusScope;
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
  labelId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
}

export interface MenuGroupContextValue { labelId: string }
const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);
MenuGroupContext.displayName = "MenuGroupContext";
export const MenuGroupContextProvider = MenuGroupContext.Provider;
export function useMenuGroupContext(): MenuGroupContextValue | null {
  return useContext(MenuGroupContext);
}

export type MenuItemCheckedState = boolean | "indeterminate";
export interface MenuItemStateContextValue { checked: MenuItemCheckedState }
const MenuItemStateContext = createContext<MenuItemStateContextValue | null>(null);
MenuItemStateContext.displayName = "MenuItemStateContext";
export const MenuItemStateContextProvider = MenuItemStateContext.Provider;
export function useMenuItemStateContext(): MenuItemStateContextValue | null {
  return useContext(MenuItemStateContext);
}

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);
MenuRadioGroupContext.displayName = "MenuRadioGroupContext";

export const MenuRadioGroupContextProvider = MenuRadioGroupContext.Provider;

export function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const ctx = useContext(MenuRadioGroupContext);
  if (!ctx) throw new Error("MenuRadioItem must be used within <MenuRadioGroup>");
  return ctx;
}
export function useOptionalMenuRadioGroupContext(): MenuRadioGroupContextValue | null {
  return useContext(MenuRadioGroupContext);
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
