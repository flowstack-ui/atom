"use client";

import { DropdownMenuTrigger } from "./primitives/dropdown-menu/index.js";
import {
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuSubContent,
  MenuSubRoot,
  MenuSubTrigger,
} from "./primitives/menu/index.js";

export { DropdownMenuTrigger } from "./primitives/dropdown-menu/index.js";
export type { DropdownMenuTriggerProps } from "./primitives/dropdown-menu/index.js";
export {
  MenuContextProvider,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioGroupContextProvider,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuSubContent,
  MenuSubContextProvider,
  MenuSubRoot,
  MenuSubTrigger,
  useMenuContext,
  useMenuRadioGroupContext,
  useMenuSubContext,
} from "./primitives/menu/index.js";
export type {
  MenuAlign,
  MenuContextValue,
  MenuCheckboxItemProps,
  MenuContentProps,
  MenuGroupProps,
  MenuItemProps,
  MenuRadioGroupProps,
  MenuRadioGroupContextValue,
  MenuRadioItemProps,
  MenuRootProps,
  MenuSeparatorProps,
  MenuSide,
  MenuInitialHighlight,
  MenuSubContentProps,
  MenuSubContextValue,
  MenuSubRootProps,
  MenuSubTriggerProps,
} from "./primitives/menu/index.js";

export const DropdownMenu = {
  Root: MenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: MenuContent,
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
