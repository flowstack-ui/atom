"use client";

import { useEffect, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from "./context.js";

type NavigationMenuContentNativeProps = NativeDivProps<"children">;

export interface NavigationMenuContentProps extends NavigationMenuContentNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  loop?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export function NavigationMenuContent({
  children,
  asChild,
  className,
  loop,
  render,
  "data-slot": dataSlot = "navigation-menu-content",
  ...restProps
}: NavigationMenuContentProps) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const { value } = itemCtx;
  const { registerContentNode, unregisterContentNode } = ctx;

  registerContentNode(value, {
    node: children,
    asChild,
    className,
    dataSlot,
    loop,
    props: restProps,
    render,
  });

  useEffect(() => {
    return () => unregisterContentNode(value);
  }, [unregisterContentNode, value]);

  return null;
}
