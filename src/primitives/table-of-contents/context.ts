"use client";
import { createContext, useContext } from "react";
import type { TableOfContentsController } from "./useTableOfContents.js";

export const ControllerContext = createContext<TableOfContentsController | null>(null);
ControllerContext.displayName = "ControllerContext";
export const ItemContext = createContext<string | null>(null);
ItemContext.displayName = "ItemContext";
export function useController() {
  const value = useContext(ControllerContext);
  if (!value) throw new Error("TableOfContents parts require Root or RootProvider.");
  return value;
}
export function useItem() {
  const value = useContext(ItemContext);
  if (value === null) throw new Error("TableOfContents.Link requires Item.");
  return value;
}
export const NavContext = createContext<{ titleId: string; setTitleId: (id: string) => void } | null>(null);
NavContext.displayName = "NavContext";
