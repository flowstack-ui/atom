"use client";
import type { ReactNode } from "react";
import { useModalContext } from "../modal/context.js";
export interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export interface DrawerContextProps {
  children: (context: DrawerContextValue) => ReactNode;
}
/** Access the existing controlled/uncontrolled owner without a second store. */
export function DrawerContext({ children }: DrawerContextProps) {
  const context = useModalContext();
  return children({ open: context.isOpen, setOpen: open => open ? context.onOpen() : context.onClose() });
}
