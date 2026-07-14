"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListProps } from "../../utils/dom.js";
import { useNavigationMenuContext } from "./context.js";

type NavigationMenuListNativeProps = NativeListProps<"children" | "role">;

export interface NavigationMenuListProps extends NavigationMenuListNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuList = forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(function NavigationMenuList(
  {
    children,
    className,
    "data-slot": dataSlot = "navigation-menu-list",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();

  return (
    <ul
      {...restProps}
      ref={ref}
      role="list"
      data-slot={dataSlot}
      data-orientation={ctx.orientation}
      className={className}
    >
      {children}
    </ul>
  );
});
