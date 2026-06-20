"use client";

import {
  MenubarContent,
  MenubarMenu,
  MenubarRoot,
  MenubarTrigger,
} from "./primitives/menubar/index.js";
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

export const Menubar = {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
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
