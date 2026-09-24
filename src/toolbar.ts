"use client";

import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "./primitives/toolbar/index.js";

export {
  ToolbarGroup,
  ToolbarInput,
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
  ToolbarGroupProps,
  ToolbarInputProps,
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
  Group: ToolbarGroup,
  Input: ToolbarInput,
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
} as const;
