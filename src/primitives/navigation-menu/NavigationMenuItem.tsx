"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  NavigationMenuItemContextProvider,
  useNavigationMenuContext,
  type NavigationMenuItemContextValue,
} from "./context.js";

type NavigationMenuItemNativeProps = NativeListItemProps<"children" | "value">;

export interface NavigationMenuItemProps extends NavigationMenuItemNativeProps {
  children: ReactNode;
  value: string;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

export const NavigationMenuItem = forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(function NavigationMenuItem(
  {
    children,
    value,
    asChild,
    className,
    render,
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
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    "data-slot": dataSlot,
    className,
  };

  return (
    <NavigationMenuItemContextProvider value={itemContextValue}>
      {asChild
        ? cloneAndMerge(children, behaviorProps)
        : renderElement(render, "li", { ...behaviorProps, children })}
    </NavigationMenuItemContextProvider>
  );
});
