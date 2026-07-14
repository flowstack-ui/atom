"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useNavigationMenuContext } from "./context.js";

type NavigationMenuListNativeProps = NativeListProps<"children" | "role">;

export interface NavigationMenuListProps extends NavigationMenuListNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

export const NavigationMenuList = forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(function NavigationMenuList(
  {
    children,
    asChild,
    className,
    render,
    "data-slot": dataSlot = "navigation-menu-list",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    role: "list",
    "data-slot": dataSlot,
    "data-orientation": ctx.orientation,
    className,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "ul", { ...behaviorProps, children });
});
