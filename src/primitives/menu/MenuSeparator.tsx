"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type MenuSeparatorNativeProps = NativeDivProps<"children" | "role">;
export interface MenuSeparatorProps extends MenuSeparatorNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuSeparator = forwardRef<HTMLElement, MenuSeparatorProps>(function MenuSeparator(
  { children, asChild = false, render, "data-slot": dataSlot = "menu-separator", ...restProps },
  ref,
) {
  const behaviorProps = { ...restProps, ref, role: "separator", "aria-orientation": "horizontal" as const, "data-slot": dataSlot };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "div", { ...behaviorProps, children });
});
