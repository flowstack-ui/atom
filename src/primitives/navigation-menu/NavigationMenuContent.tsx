"use client";

import { useEffect, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from "./context.js";

type NavigationMenuContentNativeProps = NativeDivProps<"children">;

export interface NavigationMenuContentProps extends NavigationMenuContentNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export function NavigationMenuContent({
  children,
  className,
  "data-slot": dataSlot = "navigation-menu-content",
  ...restProps
}: NavigationMenuContentProps) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const { value } = itemCtx;
  const { registerContentNode, unregisterContentNode } = ctx;

  registerContentNode(value, {
    node: children,
    className,
    dataSlot,
    props: restProps,
  });

  useEffect(() => {
    return () => unregisterContentNode(value);
  }, [unregisterContentNode, value]);

  return null;
}
