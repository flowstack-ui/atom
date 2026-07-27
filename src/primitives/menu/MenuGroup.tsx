"use client";

import { forwardRef, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { MenuGroupContextProvider } from "./context.js";
import { hasMenuLabelPart } from "./parts.js";

type MenuGroupNativeProps = NativeDivProps<"children" | "role">;
export interface MenuGroupProps extends MenuGroupNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuGroup = forwardRef<HTMLElement, MenuGroupProps>(function MenuGroup(
  { children, asChild = false, render, "data-slot": dataSlot = "menu-group", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps },
  ref,
) {
  const labelId = useId();
  const hasLabel = hasMenuLabelPart(children);
  const behaviorProps = {
    ...restProps,
    ref,
    role: "group",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy ?? (ariaLabel || !hasLabel ? undefined : labelId),
    "data-slot": dataSlot,
  };
  const content = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });
  return <MenuGroupContextProvider value={{ labelId }}>{content}</MenuGroupContextProvider>;
});
