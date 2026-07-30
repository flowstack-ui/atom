"use client";

import {
  MenubarContent,
  MenubarMenu,
  MenubarRoot,
  MenubarTrigger,
} from "./primitives/menubar/index.js";
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
  MenubarContextProvider,
  MenubarContent,
  MenubarMenu,
  MenubarMenuContextProvider,
  MenubarRoot,
  MenubarTrigger,
  useMenubarContext,
  useMenubarMenuContext,
} from "./primitives/menubar/index.js";
export type {
  MenubarContentProps,
  MenubarContextValue,
  MenubarMenuProps,
  MenubarMenuContextValue,
  MenubarRootProps,
  MenubarTriggerProps,
} from "./primitives/menubar/index.js";
export {
  MenuArrow,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubContent,
  MenuSubRoot,
  MenuSubTrigger,
} from "./primitives/menu/index.js";
export type {
  MenuArrowProps,
  MenuCloseReason,
  MenuCheckboxItemProps,
  MenuGroupProps,
  MenuItemIndicatorProps,
  MenuItemCheckedState,
  MenuItemProps,
  MenuLabelProps,
  MenuPortalProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSubContentProps,
  MenuSubRootProps,
  MenuSubTriggerProps,
} from "./primitives/menu/index.js";

export type {
  OutsideInteractionEvent,
  OutsideInteractionPointerType,
} from "./utils/interactions.js";

export const Menubar = {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Portal: MenuPortal,
  Content: MenubarContent,
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
