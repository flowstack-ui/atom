"use client";

import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsRootProvider,
  TabsContext,
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
  useTabs,
  TabsContext,
  TabsRootProvider,
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
  TabsRootProviderProps,
  UseTabsProps,
  UseTabsReturn,
  TabsIds,
} from "./primitives/tabs/index.js";

export const Tabs = {
  Root: TabsRoot,
  RootProvider: TabsRootProvider,
  Context: TabsContext,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
} as const;
