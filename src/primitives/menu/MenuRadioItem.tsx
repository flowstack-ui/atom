"use client";

import { forwardRef, useCallback, useEffect, useRef, type MouseEventHandler, type PointerEventHandler, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { MenuItemStateContextProvider, useMenuContext, useMenuRadioGroupContext } from "./context.js";

type MenuRadioItemNativeProps = NativeDivProps<"children" | "role">;
export interface MenuRadioItemProps extends MenuRadioItemNativeProps {
  value: string;
  textValue?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuRadioItem = forwardRef<HTMLElement, MenuRadioItemProps>(function MenuRadioItem(
  { value, textValue, disabled = false, closeOnSelect = false, children, asChild = false, render, onClick, onPointerEnter, onPointerLeave, onFocus, "data-slot": dataSlot = "menu-radio-item", ...restProps },
  forwardedRef,
) {
  const ctx = useMenuContext();
  const radioCtx = useMenuRadioGroupContext();
  const ref = useRef<HTMLElement>(null);
  const itemValue = `${radioCtx.groupId}:${value}`;
  const isHighlighted = ctx.highlightedValue === itemValue;
  const isChecked = radioCtx.value === value;
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    ctx.registerItem(itemValue, element);
    return () => ctx.unregisterItem(itemValue);
  }, [ctx.registerItem, ctx.unregisterItem, itemValue]);
  useEffect(() => {
    ctx.registerLabel(itemValue, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, itemValue, textValue, value]);
  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled) return;
    radioCtx.onValueChange(value);
    ctx.onItemSelect(itemValue, { closeOnSelect });
  }, [closeOnSelect, ctx, disabled, itemValue, radioCtx, value]);
  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse") return;
    ctx.onHighlight(itemValue);
    event.currentTarget.focus({ preventScroll: true });
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, itemValue]);
  const behaviorProps = {
    ...restProps,
    ref: composeRefs(ref, forwardedRef),
    role: "menuitemradio",
    tabIndex: -1,
    "aria-checked": isChecked,
    "aria-disabled": disabled || undefined,
    "data-slot": dataSlot,
    "data-state": isChecked ? "checked" : "unchecked",
    "data-highlighted": isHighlighted ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-checked": isChecked ? "" : undefined,
    "data-value": value,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave,
    onFocus: composeEventHandlers(onFocus, () => ctx.onHighlight(itemValue)),
  };
  const content = asChild ? cloneAndMerge(children, behaviorProps) : renderElement(render, "div", { ...behaviorProps, children });
  return <MenuItemStateContextProvider value={{ checked: isChecked }}>{content}</MenuItemStateContextProvider>;
});
