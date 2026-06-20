"use client";

import { createContext, useContext, type RefObject } from "react";
import type { PopoverSide } from "./PopoverContent.js";

export type PopoverTriggerMode = "click" | "hover";

export interface PopoverContextValue {
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  popoverId: string;
  triggerRef: RefObject<HTMLElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  modal: boolean;
  closeOnInteractOutside: boolean;
  triggerMode: PopoverTriggerMode;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
PopoverContext.displayName = "PopoverContext";

export const PopoverContextProvider = PopoverContext.Provider;

export function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error("Popover compound components must be used within <PopoverRoot>");
  }
  return ctx;
}

export interface PopoverContentContextValue {
  arrowRef: RefObject<SVGSVGElement | null>;
  side: PopoverSide;
  arrowX?: number;
  arrowY?: number;
}

const PopoverContentContext = createContext<PopoverContentContextValue | null>(null);
PopoverContentContext.displayName = "PopoverContentContext";

export const PopoverContentContextProvider = PopoverContentContext.Provider;

export function usePopoverContentContext(): PopoverContentContextValue {
  const ctx = useContext(PopoverContentContext);
  if (!ctx) {
    throw new Error("Popover.Arrow must be used within <Popover.Content>");
  }
  return ctx;
}
