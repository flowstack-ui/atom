"use client";

import {
  ToolbarButton,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "./primitives/toolbar/index.js";

export {
  ToolbarButton,
  ToolbarContextProvider,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleContextProvider,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  useToolbarContext,
  useToolbarItem,
  useToolbarToggleContext,
} from "./primitives/toolbar/index.js";
export type {
  ToolbarButtonProps,
  ToolbarContextValue,
  ToolbarDirection,
  ToolbarLinkProps,
  ToolbarOrientation,
  ToolbarRootProps,
  ToolbarSeparatorProps,
  ToolbarToggleContextValue,
  ToolbarToggleGroupProps,
  ToolbarToggleItemProps,
  ToolbarToggleType,
} from "./primitives/toolbar/index.js";

export const Toolbar = {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
} as const;
