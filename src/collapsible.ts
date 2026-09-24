"use client";

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleRootProvider,
  CollapsibleContext,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "./primitives/collapsible/index.js";

export {
  CollapsibleContent,
  CollapsibleContextProvider,
  CollapsibleRoot,
  CollapsibleRootProvider,
  CollapsibleContext,
  CollapsibleIndicator,
  useCollapsible,
  CollapsibleTrigger,
  useCollapsibleContext,
} from "./primitives/collapsible/index.js";
export type {
  CollapsibleContentProps,
  CollapsibleContextValue,
  CollapsibleRootProps,
  CollapsibleRootProviderProps,
  CollapsibleIndicatorProps,
  UseCollapsibleOptions,
  UseCollapsibleReturn,
  CollapsibleTriggerProps,
} from "./primitives/collapsible/index.js";

export const Collapsible = {
  Root: CollapsibleRoot,
  RootProvider: CollapsibleRootProvider,
  Context: CollapsibleContext,
  Indicator: CollapsibleIndicator,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
} as const;
