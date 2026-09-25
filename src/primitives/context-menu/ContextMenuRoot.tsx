"use client";

import { type ReactNode } from "react";
import { MenuRootProvider, useMenu, type MenuRootProps, type UseMenuOptions, type UseMenuReturn } from "../menu/MenuRoot.js";
import { useMenuContext } from "../menu/context.js";
import {
  ContextMenuContextProvider,
  type ContextMenuAnchorPoint,
} from "./context.js";

export interface ContextMenuRootProps extends MenuRootProps {}
export type UseContextMenuOptions = UseMenuOptions;
export type UseContextMenuReturn = UseMenuReturn;
export const useContextMenu = useMenu;

function ContextPointProvider({ children }: { children: ReactNode }) {
  const context = useMenuContext();
  return <ContextMenuContextProvider value={{ anchorPoint: context.anchorPoint ?? null, setAnchorPoint: context.setAnchorPoint! }}>{children}</ContextMenuContextProvider>;
}
export interface ContextMenuRootProviderProps { value: UseContextMenuReturn; children: ReactNode }
export function ContextMenuRootProvider({ value, children }: ContextMenuRootProviderProps) {
  return <MenuRootProvider value={value}><ContextPointProvider>{children}</ContextPointProvider></MenuRootProvider>;
}
export function ContextMenuRoot({ children, ...options }: ContextMenuRootProps) {
  const value = useContextMenu(options);
  return <ContextMenuRootProvider value={value}>{children}</ContextMenuRootProvider>;
}
