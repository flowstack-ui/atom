"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DirectionValue } from "../direction/index.js";

export interface AccordionContextValue {
  rootId: string;
  ids?: { root?: string; item?: (value: string) => string; itemTrigger?: (value: string) => string; itemContent?: (value: string) => string };
  lazyMount: boolean;
  unmountOnExit: boolean;
  hideMode: "display-none" | "activity";
  onExitComplete?: (value: string) => void;
  onFocusChange?: (details: { value: string | null }) => void;
  setValue: (value: string[]) => void;
  /** Currently expanded item values. */
  value: string[];
  /** Toggle an item's expanded state. */
  onToggle: (itemValue: string) => void;
  /** Whether multiple items can be open simultaneously. */
  multiple: boolean;
  /** Whether all items can be closed in single mode. */
  collapsible: boolean;
  /** Global disabled state. */
  disabled: boolean;
  /** Orientation for keyboard navigation. */
  orientation: "vertical" | "horizontal";
  /** Text direction for horizontal keyboard navigation. */
  dir: DirectionValue;
  /** Register a trigger for keyboard navigation. */
  registerTrigger: (
    value: string,
    element: HTMLButtonElement,
    disabled: boolean,
  ) => void;
  /** Unregister a trigger. */
  unregisterTrigger: (value: string) => void;
  /** Ordered trigger values. */
  getTriggerValues: () => string[];
  /** Trigger element lookup. */
  getTriggerElement: (value: string) => HTMLButtonElement | null;
  /** Next enabled trigger value. */
  getNextTriggerValue: (
    value: string,
    direction: "next" | "previous",
  ) => string | null;
  /** First enabled trigger value. */
  getFirstTriggerValue: () => string | null;
  /** Last enabled trigger value. */
  getLastTriggerValue: () => string | null;
}

const RootContext = createContext<AccordionContextValue | null>(null);
RootContext.displayName = "AccordionContext";

export const AccordionContextProvider = RootContext.Provider;
export function AccordionContext({ children }: { children: (value: AccordionContextValue) => ReactNode }) { return children(useAccordionContext()); }

export function useAccordionContext(): AccordionContextValue {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("Accordion compound components must be used within <AccordionRoot>.");
  }
  return context;
}

export interface AccordionItemContextValue {
  /** This item's unique value. */
  value: string;
  /** Whether this item is expanded. */
  isOpen: boolean;
  /** Toggle this item. */
  onToggle: () => void;
  /** Content panel ID. */
  contentId: string;
  /** Trigger ID. */
  triggerId: string;
  /** Whether this item is disabled. */
  disabled: boolean;
}

const ItemContext = createContext<AccordionItemContextValue | null>(null);
ItemContext.displayName = "AccordionItemContext";

export const AccordionItemContextProvider = ItemContext.Provider;
export function AccordionItemContext({ children }: { children: (value: AccordionItemContextValue) => ReactNode }) { return children(useAccordionItemContext()); }

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("Accordion item compounds must be used within <AccordionItem>.");
  }
  return context;
}
