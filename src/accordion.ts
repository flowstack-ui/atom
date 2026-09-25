"use client";

import {
  AccordionRootProvider,
  AccordionContext,
  AccordionItemContext,
  AccordionIndicator,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "./primitives/accordion/index.js";

export {
  AccordionRootProvider,
  AccordionContext,
  AccordionItemContext,
  AccordionIndicator,
  useAccordion,
  AccordionContent,
  AccordionContextProvider,
  AccordionHeader,
  AccordionItem,
  AccordionItemContextProvider,
  AccordionRoot,
  AccordionTrigger,
  useAccordionContext,
  useAccordionItemContext,
} from "./primitives/accordion/index.js";
export type {
  AccordionRootProviderProps,
  AccordionIndicatorProps,
  UseAccordionOptions,
  UseAccordionReturn,
  AccordionContentProps,
  AccordionContextValue,
  AccordionHeaderLevel,
  AccordionHeaderProps,
  AccordionItemContextValue,
  AccordionItemProps,
  AccordionRootMultipleProps,
  AccordionRootProps,
  AccordionRootSingleProps,
  AccordionTriggerProps,
} from "./primitives/accordion/index.js";

export const Accordion = {
  RootProvider: AccordionRootProvider,
  Context: AccordionContext,
  ItemContext: AccordionItemContext,
  Indicator: AccordionIndicator,
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
} as const;
