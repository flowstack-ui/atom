"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useMenuGroupContext, useOptionalMenuRadioGroupContext } from "./context.js";
import { markMenuLabelPart } from "./parts.js";

type MenuLabelNativeProps = NativeDivProps<"children">;
export interface MenuLabelProps extends MenuLabelNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuLabel = forwardRef<HTMLElement, MenuLabelProps>(function MenuLabel(
  { children, asChild = false, render, id, "data-slot": dataSlot = "menu-label", ...restProps },
  ref,
) {
  const group = useMenuGroupContext();
  const radioGroup = useOptionalMenuRadioGroupContext();
  const behaviorProps = {
    ...restProps,
    ref,
    id: id ?? radioGroup?.labelId ?? group?.labelId,
    "data-slot": dataSlot,
  };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "div", { ...behaviorProps, children });
});
markMenuLabelPart(MenuLabel);
