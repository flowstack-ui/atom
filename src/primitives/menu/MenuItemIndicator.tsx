"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useMenuItemStateContext } from "./context.js";

type MenuItemIndicatorNativeProps = NativeSpanProps<"children">;
export interface MenuItemIndicatorProps extends MenuItemIndicatorNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuItemIndicator = forwardRef<HTMLElement, MenuItemIndicatorProps>(
function MenuItemIndicator(
  { children, forceMount = false, asChild = false, render, "data-slot": dataSlot = "menu-item-indicator", ...restProps },
  ref,
) {
  const state = useMenuItemStateContext();
  if (!state) throw new Error("MenuItemIndicator must be used within a CheckboxItem or RadioItem");
  const visible = state.checked === true || state.checked === "indeterminate";
  if (!visible && !forceMount) return null;
  const dataState = state.checked === "indeterminate" ? "indeterminate" : state.checked ? "checked" : "unchecked";
  const behaviorProps = { ...restProps, ref, "aria-hidden": true, "data-slot": dataSlot, "data-state": dataState };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "span", { ...behaviorProps, children });
});
