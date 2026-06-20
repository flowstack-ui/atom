"use client";

import { type ReactNode } from "react";
import { MenuRoot } from "../menu/index.js";
import { MenubarMenuContextProvider, useMenubarContext } from "./context.js";

export interface MenubarMenuProps {
  children: ReactNode;
  value: string;
  closeOnSelect?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
}

export function MenubarMenu({
  children,
  value,
  closeOnSelect = true,
  loop = true,
  closeOnEscape = true,
}: MenubarMenuProps) {
  const barCtx = useMenubarContext();

  return (
    <MenuRoot
      open={barCtx.openValue === value}
      onOpenChange={(open) => {
        if (open) {
          barCtx.onMenuOpen(value);
        } else {
          barCtx.onMenuClose();
        }
      }}
      modal={false}
      closeOnSelect={closeOnSelect}
      loop={loop}
      closeOnEscape={closeOnEscape}
    >
      <MenubarMenuContextProvider value={{ menuValue: value }}>
        {children}
      </MenubarMenuContextProvider>
    </MenuRoot>
  );
}
