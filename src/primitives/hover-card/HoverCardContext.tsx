"use client";
import type { ReactNode } from "react";
import { useHoverCardContext } from "./context.js";

export interface HoverCardContextProps {
  children: (details: { open: boolean; triggerValue: string | undefined }) => ReactNode;
}
export function HoverCardContext({ children }: HoverCardContextProps) {
  const context = useHoverCardContext();
  return children({ open: context.isOpen, triggerValue: context.triggerValue });
}
