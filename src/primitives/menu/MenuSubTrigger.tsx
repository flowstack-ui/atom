"use client";

import { forwardRef, useCallback, useEffect, useRef, type KeyboardEventHandler, type MouseEventHandler, type PointerEventHandler, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDirection } from "../direction/index.js";
import { getMenuSubmenuOpenKey, useMenuContext, useMenuSubContext } from "./context.js";

const HOVER_DELAY = 100;
type MenuSubTriggerNativeProps = NativeDivProps<"children" | "role">;
export interface MenuSubTriggerProps extends MenuSubTriggerNativeProps {
  value: string;
  textValue?: string;
  disabled?: boolean;
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuSubTrigger = forwardRef<HTMLElement, MenuSubTriggerProps>(function MenuSubTrigger(
  { value, textValue, disabled = false, children, asChild = false, render, onClick, onPointerEnter, onPointerLeave, onKeyDown, onFocus, "data-slot": dataSlot = "menu-sub-trigger", ...restProps },
  forwardedRef,
) {
  const ctx = useMenuContext();
  const subCtx = useMenuSubContext();
  const dir = useDirection();
  const ref = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  if (!subCtx) throw new Error("MenuSubTrigger must be used within <MenuSubRoot>");
  const isHighlighted = ctx.highlightedValue === value;
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    ctx.registerItem(value, element);
    subCtx.subTriggerRef.current = element;
    return () => ctx.unregisterItem(value);
  }, [ctx.registerItem, ctx.unregisterItem, subCtx.subTriggerRef, value]);
  useEffect(() => {
    ctx.registerLabel(value, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, textValue, value]);
  useEffect(() => () => clearTimeout(hoverTimeoutRef.current), []);
  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse") return;
    ctx.onHighlight(value);
    event.currentTarget.focus({ preventScroll: true });
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(subCtx.onOpen, HOVER_DELAY);
  }, [ctx, subCtx.onOpen, value]);
  const handlePointerLeave: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType === "mouse") clearTimeout(hoverTimeoutRef.current);
  }, []);
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback((event) => {
    if (disabled || event.key !== getMenuSubmenuOpenKey(dir)) return;
    event.preventDefault();
    event.stopPropagation();
    subCtx.onOpen();
  }, [dir, disabled, subCtx]);
  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (!disabled) subCtx.onToggle();
  }, [disabled, subCtx]);
  const behaviorProps = {
    ...restProps,
    ref: composeRefs(ref, forwardedRef),
    id: subCtx.subTriggerId,
    role: "menuitem",
    tabIndex: -1,
    "aria-haspopup": "menu",
    "aria-expanded": subCtx.isOpen,
    "aria-disabled": disabled || undefined,
    "data-slot": dataSlot,
    "data-state": subCtx.isOpen ? "open" : "closed",
    "data-highlighted": isHighlighted ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-value": value,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onFocus: composeEventHandlers(onFocus, () => ctx.onHighlight(value)),
  };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "div", { ...behaviorProps, children });
});
