"use client";

import { useMemo, type ReactNode } from "react";
import { MenuRoot, type MenuRootProps } from "../menu/index.js";
import { MenubarMenuContextProvider, useMenubarContext } from "./context.js";

export interface MenubarMenuProps extends Omit<MenuRootProps, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
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
  persistentElements,
  ...options
}: MenubarMenuProps) {
  const barCtx = useMenubarContext();
  // Adjacent triggers belong to this composite, not to the outside page.
  // Focus moves synchronously before the previous popup's effects clean up.
  const menuPersistentElements = useMemo(
    () => [() => barCtx.rootRef.current, ...(persistentElements ?? [])],
    [barCtx.rootRef, persistentElements],
  );

  return (
    <MenuRoot
      {...options}
      persistentElements={menuPersistentElements}
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
