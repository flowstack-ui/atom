"use client";

import { forwardRef, useCallback, useEffect, useRef, type MouseEventHandler, type PointerEventHandler, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { MenuItemStateContextProvider, useMenuContext, type MenuItemCheckedState } from "./context.js";

type MenuCheckboxItemNativeProps = NativeDivProps<"children" | "role">;
export interface MenuCheckboxItemProps extends MenuCheckboxItemNativeProps {
  value: string;
  textValue?: string;
  checked?: MenuItemCheckedState;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuCheckboxItem = forwardRef<HTMLElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  { value, textValue, checked = false, onCheckedChange, disabled = false, closeOnSelect = false, children, asChild = false, render, onClick, onPointerEnter, onPointerLeave, onFocus, "data-slot": dataSlot = "menu-checkbox-item", ...restProps },
  forwardedRef,
) {
  const ctx = useMenuContext();
  const ref = useRef<HTMLElement>(null);
  const isHighlighted = ctx.highlightedValue === value;
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    ctx.registerItem(value, element);
    return () => ctx.unregisterItem(value);
  }, [ctx.registerItem, ctx.unregisterItem, value]);
  useEffect(() => {
    ctx.registerLabel(value, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, textValue, value]);
  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled) return;
    onCheckedChange?.(checked === "indeterminate" ? true : !checked);
    ctx.onItemSelect(value, { closeOnSelect });
  }, [checked, closeOnSelect, ctx, disabled, onCheckedChange, value]);
  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse") return;
    ctx.onHighlight(value);
    event.currentTarget.focus({ preventScroll: true });
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, value]);
  const dataState = checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked";
  const behaviorProps = {
    ...restProps,
    ref: composeRefs(ref, forwardedRef),
    role: "menuitemcheckbox",
    tabIndex: -1,
    "aria-checked": checked === "indeterminate" ? "mixed" : checked,
    "aria-disabled": disabled || undefined,
    "data-slot": dataSlot,
    "data-state": dataState,
    "data-highlighted": isHighlighted ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-checked": checked === true ? "" : undefined,
    "data-indeterminate": checked === "indeterminate" ? "" : undefined,
    "data-value": value,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave,
    onFocus: composeEventHandlers(onFocus, () => ctx.onHighlight(value)),
  };
  const content = asChild ? cloneAndMerge(children, behaviorProps) : renderElement(render, "div", { ...behaviorProps, children });
  return <MenuItemStateContextProvider value={{ checked }}>{content}</MenuItemStateContextProvider>;
});
