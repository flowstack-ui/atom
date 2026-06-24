"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMenuContext } from "./context.js";

type MenuItemNativeProps = NativeDivProps<"children" | "role">;

export interface MenuItemProps extends MenuItemNativeProps {
  value: string;
  textValue?: string;
  onSelect?: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  className?: string;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
  children: ReactNode;
}

export const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  {
    value,
    textValue,
    onSelect,
    disabled = false,
    closeOnSelect: closeOnSelectProp,
    className,
    asChild = false,
    render,
    "data-slot": dataSlot = "menu-item",
    children,
    onClick,
    onPointerEnter,
    onPointerLeave,
    ...restProps
  },
  forwardedRef,
) {
  const ctx = useMenuContext();
  const ref = useRef<HTMLElement>(null);
  const closeOnSelect = closeOnSelectProp ?? ctx.closeOnSelect;
  const isHighlighted = ctx.highlightedValue === value;

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return undefined;
    ctx.registerItem(value, element);
    return () => ctx.unregisterItem(value);
  }, [ctx.registerItem, ctx.unregisterItem, disabled, value]);

  useEffect(() => {
    if (disabled) return;
    ctx.registerLabel(value, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, disabled, textValue, value]);

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled) return;
    onSelect?.();
    ctx.onItemSelect(value, { closeOnSelect });
    if (closeOnSelect) {
      ctx.triggerRef.current?.focus();
    }
  }, [closeOnSelect, ctx, disabled, onSelect, value]);

  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback(() => {
    if (disabled) return;
    ctx.onHighlight(value);
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, disabled, value]);

  const handlePointerLeave: PointerEventHandler<HTMLElement> = useCallback(() => {
    if (ctx.highlightedValue === value) ctx.onHighlight(null);
  }, [ctx, value]);

  const behaviorProps = {
    ...restProps,
    ref: composeRefs(ref, forwardedRef),
    role: "menuitem",
    tabIndex: -1,
    "data-slot": dataSlot,
    "data-highlighted": isHighlighted ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-value": value,
    "aria-disabled": disabled || undefined,
    className,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", { ...behaviorProps, children });
});
