"use client";

import { createContext, useContext, type RefObject } from "react";
import type { FloatingRootContext, UseInteractionsReturn } from "@floating-ui/react";
import type { HoverCardSide } from "./HoverCardContent.js";

export interface HoverCardContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hoverCardId: string;
  triggerRef: RefObject<HTMLElement | null>;
  setTriggerElement: (element: HTMLElement | null) => void;
  setContentElement: (element: HTMLElement | null) => void;
  floatingRootContext: FloatingRootContext;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  markTouchInteraction: () => void;
  hasRecentTouchInteraction: () => boolean;
  disabled: boolean;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);
HoverCardContext.displayName = "HoverCardContext";

export const HoverCardContextProvider = HoverCardContext.Provider;

export function useHoverCardContext(): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error("HoverCard compound components must be used within <HoverCardRoot>");
  }
  return ctx;
}

export interface HoverCardContentContextValue {
  arrowRef: RefObject<SVGSVGElement | null>;
  side: HoverCardSide;
  arrowX?: number;
  arrowY?: number;
}

const HoverCardContentContext = createContext<HoverCardContentContextValue | null>(null);
HoverCardContentContext.displayName = "HoverCardContentContext";

export const HoverCardContentContextProvider = HoverCardContentContext.Provider;

export function useHoverCardContentContext(): HoverCardContentContextValue {
  const ctx = useContext(HoverCardContentContext);
  if (!ctx) {
    throw new Error("HoverCard.Arrow must be used within <HoverCardContent>");
  }
  return ctx;
}
