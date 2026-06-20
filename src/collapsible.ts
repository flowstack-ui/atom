"use client";

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "./primitives/collapsible/index.js";

export {
  CollapsibleContent,
  CollapsibleContextProvider,
  CollapsibleRoot,
  CollapsibleTrigger,
  useCollapsibleContext,
} from "./primitives/collapsible/index.js";
export type {
  CollapsibleContentProps,
  CollapsibleContextValue,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
} from "./primitives/collapsible/index.js";

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
} as const;
