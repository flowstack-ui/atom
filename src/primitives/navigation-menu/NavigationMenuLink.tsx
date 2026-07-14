"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { useNavigationMenuContext } from "./context.js";
import type { NativeAnchorProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type NavigationMenuLinkNativeProps = NativeAnchorProps<"children" | "href">;

export interface NavigationMenuLinkProps extends NavigationMenuLinkNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  href?: string;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuLink = forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(function NavigationMenuLink(
  {
    children,
    asChild,
    render,
    href,
    active = false,
    onSelect,
    className,
    onClick,
    "data-slot": dataSlot = "navigation-menu-link",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      onClick?.(event);
      onSelect?.();

      if (ctx.value !== null) {
        ctx.onValueChange(null);
      }
    },
    [ctx, onClick, onSelect],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    ...(!asChild && href !== undefined ? { href } : {}),
    "data-slot": dataSlot,
    "data-active": active ? "" : undefined,
    "aria-current": active ? "page" : undefined,
    className,
    onClick: handleClick,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "a", { ...behaviorProps, children });
});
