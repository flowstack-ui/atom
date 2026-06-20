"use client";

import { createContext, useContext } from "react";

export interface AccordionContextValue {
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

const AccordionContext = createContext<AccordionContextValue | null>(null);
AccordionContext.displayName = "AccordionContext";

export const AccordionContextProvider = AccordionContext.Provider;

export function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext);
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

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);
AccordionItemContext.displayName = "AccordionItemContext";

export const AccordionItemContextProvider = AccordionItemContext.Provider;

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error("Accordion item compounds must be used within <AccordionItem>.");
  }
  return context;
}
