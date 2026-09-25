"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import { NavigationMenuPanel } from "./NavigationMenuPanel.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from "./context.js";

type NavigationMenuContentNativeProps = NativeDivProps<"children">;

export interface NavigationMenuContentProps extends NavigationMenuContentNativeProps {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: OutsideInteractionEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  onInteractOutside?: (event: OutsideInteractionEvent | FocusEvent) => void;
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  loop?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(function NavigationMenuContent({
  children,
  asChild,
  className,
  loop,
  render,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  "data-slot": dataSlot = "navigation-menu-content",
  ...restProps
}, ref) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const { value } = itemCtx;
  const { registerContentNode, unregisterContentNode } = ctx;

  const entry = {
    node: children,
    ref,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    asChild,
    className,
    dataSlot,
    loop,
    props: restProps,
    render,
  };
  registerContentNode(value, entry);

  useEffect(() => {
    return () => unregisterContentNode(value);
  }, [unregisterContentNode, value]);

  return ctx.viewport ? null : <NavigationMenuPanel value={value} entry={entry} />;
});
