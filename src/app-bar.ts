import {
  AppBarCenter,
  AppBarEnd,
  AppBarRoot,
  AppBarStart,
  AppBarToolbar,
} from "./primitives/app-bar/index.js";

export {
  AppBarCenter,
  AppBarEnd,
  AppBarRoot,
  AppBarStart,
  AppBarToolbar,
} from "./primitives/app-bar/index.js";
export type {
  AppBarDensity,
  AppBarPosition,
  AppBarRootProps,
  AppBarSectionProps,
  AppBarToolbarProps,
} from "./primitives/app-bar/index.js";

export const AppBar = {
  Root: AppBarRoot,
  Toolbar: AppBarToolbar,
  Start: AppBarStart,
  Center: AppBarCenter,
  End: AppBarEnd,
} as const;
