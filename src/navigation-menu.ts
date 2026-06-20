"use client";

import {
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./primitives/navigation-menu/index.js";

export {
  NavigationMenuContent,
  NavigationMenuContextProvider,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuItemContextProvider,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  getNavigationMenuGeometry,
  getNavigationMenuGeometryStyle,
  getNavigationMenuViewportSizeStyle,
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from "./primitives/navigation-menu/index.js";
export type {
  ContentNodeEntry,
  NavigationMenuContentProps,
  NavigationMenuContextValue,
  NavigationMenuGeometry,
  NavigationMenuGeometryOptions,
  NavigationMenuGeometryStyle,
  NavigationMenuIndicatorProps,
  NavigationMenuItemProps,
  NavigationMenuItemContextValue,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuRect,
  NavigationMenuRootProps,
  NavigationMenuSubProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
} from "./primitives/navigation-menu/index.js";

export const NavigationMenu = {
  Root: NavigationMenuRoot,
  Sub: NavigationMenuSub,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
} as const;
