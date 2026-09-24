"use client";
import type { ReactNode } from "react";
import { useMenuContext } from "./context.js";
import type { UseMenuReturn } from "./MenuRoot.js";

export type MenuState = Pick<UseMenuReturn, "open" | "highlightedValue" | "triggerValue" | "setOpen" | "setTriggerValue" | "reposition">;
export function useMenuState(): MenuState {
  const context = useMenuContext();
  return { open: context.isOpen, highlightedValue: context.publicHighlightedValue ?? context.highlightedValue, triggerValue: context.triggerValue, setOpen: open => open ? context.onOpen() : context.onClose(), setTriggerValue: value => context.setTriggerValue?.(value), reposition: () => context.updateRef?.current?.() };
}
export interface MenuContextProps { children: (state: MenuState) => ReactNode }
export function MenuContext({ children }: MenuContextProps) { return children(useMenuState()); }
