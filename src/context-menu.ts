"use client";

import {
  ContextMenuContent,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "./primitives/context-menu/index.js";
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubContent,
  MenuSubRoot,
  MenuSubTrigger,
} from "./primitives/menu/index.js";

export {
  ContextMenuContextProvider,
  ContextMenuContent,
  ContextMenuRoot,
  ContextMenuTrigger,
  useContextMenuContext,
} from "./primitives/context-menu/index.js";
export type {
  ContextMenuAnchorPoint,
  ContextMenuContextValue,
  ContextMenuContentProps,
  ContextMenuRootProps,
  ContextMenuTriggerProps,
} from "./primitives/context-menu/index.js";
export {
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuSeparator,
  MenuSubRoot,
  MenuSubTrigger,
  MenuSubContent,
} from "./primitives/menu/index.js";
export type {
  MenuContentProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuGroupProps,
  MenuSeparatorProps,
  MenuSubRootProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "./primitives/menu/index.js";

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;
