"use client";

import {
  BottomNavigationItem,
  BottomNavigationRoot,
} from "./primitives/bottom-navigation/index.js";

export {
  BottomNavigationContextProvider,
  BottomNavigationItem,
  BottomNavigationRoot,
  useBottomNavigationContext,
} from "./primitives/bottom-navigation/index.js";
export type {
  BottomNavigationContextValue,
  BottomNavigationItemProps,
  BottomNavigationRootProps,
} from "./primitives/bottom-navigation/index.js";

export const BottomNavigation = {
  Root: BottomNavigationRoot,
  Item: BottomNavigationItem,
} as const;
