"use client";

import {
  ContextMenuContent,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "./primitives/context-menu/index.js";
import {
  MenuCheckboxItem,
  MenuArrow,
  MenuGroup,
  MenuItemIndicator,
  MenuItem,
  MenuLabel,
  MenuPortal,
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
  MenuArrow,
  MenuCheckboxItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuLabel,
  MenuPortal,
  MenuSeparator,
  MenuSubRoot,
  MenuSubTrigger,
  MenuSubContent,
} from "./primitives/menu/index.js";
export type {
  MenuContentProps,
  MenuCloseReason,
  MenuArrowProps,
  MenuItemProps,
  MenuItemIndicatorProps,
  MenuItemCheckedState,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuGroupProps,
  MenuLabelProps,
  MenuPortalProps,
  MenuSeparatorProps,
  MenuSubRootProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "./primitives/menu/index.js";

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: MenuPortal,
  Content: ContextMenuContent,
  Arrow: MenuArrow,
  Label: MenuLabel,
  Item: MenuItem,
  ItemIndicator: MenuItemIndicator,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;
