"use client";

import { createContext, useContext, type RefObject } from "react";
import type { PopoverSide } from "./PopoverContent.js";
import type { PopoverPartKind } from "./parts.js";

export type PopoverTriggerMode = "click" | "hover";
export type PopoverInteractionType =
  | "keyboard"
  | "mouse"
  | "touch"
  | "pen"
  | "programmatic";
export type PopoverOpenReason =
  | "triggerClick"
  | "triggerHover"
  | "programmatic";
export type PopoverCloseReason =
  | "triggerClick"
  | "hoverLeave"
  | "escapeKeyDown"
  | "closeClick"
  | "interactOutside"
  | "focusOutside"
  | "programmatic";

export interface PopoverInitialFocusDetails {
  interactionType: PopoverInteractionType;
  reason: PopoverOpenReason;
}

export interface PopoverFinalFocusDetails {
  interactionType: PopoverInteractionType;
  reason: PopoverCloseReason;
}

export interface PopoverContextValue {
  isOpen: boolean;
  onToggle: (interactionType?: PopoverInteractionType) => void;
  onOpen: (
    reason?: PopoverOpenReason,
    interactionType?: PopoverInteractionType,
  ) => void;
  onClose: (
    reason?: PopoverCloseReason,
    interactionType?: PopoverInteractionType,
  ) => void;
  initialFocusDetails: PopoverInitialFocusDetails;
  finalFocusDetails: PopoverFinalFocusDetails;
  recordInteraction: (
    interactionType: Exclude<PopoverInteractionType, "programmatic">,
    target: EventTarget | null,
  ) => void;
  consumeInteraction: (target: EventTarget | null) => PopoverInteractionType;
  clearInteraction: (target?: EventTarget | null) => void;
  popoverId: string;
  titleId: string;
  descriptionId: string;
  titleCount: number;
  descriptionCount: number;
  partRegistryReady: boolean;
  registerPart: (kind: PopoverPartKind) => () => void;
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
