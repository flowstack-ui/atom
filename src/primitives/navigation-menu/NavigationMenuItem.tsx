"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import {
  NavigationMenuItemContextProvider,
  useNavigationMenuContext,
  type NavigationMenuItemContextValue,
} from "./context.js";

type NavigationMenuItemNativeProps = NativeListItemProps<"children" | "value">;

export interface NavigationMenuItemProps extends NavigationMenuItemNativeProps {
  children: ReactNode;
  value: string;
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuItem = forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(function NavigationMenuItem(
  {
    children,
    value,
    className,
    "data-slot": dataSlot = "navigation-menu-item",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();
  const { registerItem, unregisterItem } = ctx;

  useEffect(() => {
    registerItem(value);
    return () => unregisterItem(value);
  }, [registerItem, unregisterItem, value]);

  const itemContextValue: NavigationMenuItemContextValue = { value };

  return (
    <NavigationMenuItemContextProvider value={itemContextValue}>
      <li
        {...restProps}
        ref={ref}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </li>
    </NavigationMenuItemContextProvider>
  );
});
