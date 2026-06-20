"use client";

import { createContext, useContext, type RefObject } from "react";
import type { TooltipSide } from "./TooltipContent.js";

export interface TooltipProviderContextValue {
  openDelay: number;
  closeDelay: number;
  skipDelay: number;
  onTooltipClose: () => void;
  isSkipDelayActive: () => boolean;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue | null>(null);
TooltipProviderContext.displayName = "TooltipProviderContext";

export const TooltipProviderContextProvider = TooltipProviderContext.Provider;

export function useTooltipProviderContext(): TooltipProviderContextValue | null {
  return useContext(TooltipProviderContext);
}

export interface TooltipContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  tooltipId: string;
  triggerRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  isTouchRef: RefObject<boolean>;
  variant: "plain" | "rich";
}

const TooltipContext = createContext<TooltipContextValue | null>(null);
TooltipContext.displayName = "TooltipContext";

export const TooltipContextProvider = TooltipContext.Provider;

export function useTooltipContext(): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error("Tooltip compound components must be used within <TooltipRoot>");
  }
  return ctx;
}

export interface TooltipContentContextValue {
  arrowRef: RefObject<SVGSVGElement | null>;
  side: TooltipSide;
  arrowX?: number;
  arrowY?: number;
}

const TooltipContentContext = createContext<TooltipContentContextValue | null>(null);
TooltipContentContext.displayName = "TooltipContentContext";

export const TooltipContentContextProvider = TooltipContentContext.Provider;

export function useTooltipContentContext(): TooltipContentContextValue {
  const ctx = useContext(TooltipContentContext);
  if (!ctx) {
    throw new Error("Tooltip.Arrow must be used within <TooltipContent>");
  }
  return ctx;
}
