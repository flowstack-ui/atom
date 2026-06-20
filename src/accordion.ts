"use client";

import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "./primitives/accordion/index.js";

export {
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
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
} as const;
