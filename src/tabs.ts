"use client";

import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "./primitives/tabs/index.js";

export {
  TabsContent,
  TabsContextProvider,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
  useTabsContext,
} from "./primitives/tabs/index.js";
export type {
  TabsActivationMode,
  TabsContentProps,
  TabsContextValue,
  TabsIndicatorProps,
  TabsListProps,
  TabsOrientation,
  TabsRootProps,
  TabsTriggerProps,
} from "./primitives/tabs/index.js";

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
} as const;
