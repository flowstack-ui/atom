"use client";

import {
  SidebarMain,
  SidebarPanel,
  SidebarRoot,
  SidebarTrigger,
} from "./primitives/sidebar/index.js";

export {
  SidebarContextProvider,
  SidebarMain,
  SidebarPanel,
  SidebarRoot,
  SidebarTrigger,
  useSidebarContext,
} from "./primitives/sidebar/index.js";
export type {
  SidebarCollapsedState,
  SidebarContextValue,
  SidebarMainProps,
  SidebarPanelProps,
  SidebarRootProps,
  SidebarSide,
  SidebarState,
  SidebarTriggerProps,
} from "./primitives/sidebar/index.js";

export const Sidebar = {
  Root: SidebarRoot,
  Trigger: SidebarTrigger,
  Panel: SidebarPanel,
  Main: SidebarMain,
} as const;
