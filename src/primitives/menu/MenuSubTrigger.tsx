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
  { value, textValue, disabled = false, children, asChild = false, render, onClick, onPointerEnter, onPointerMove, onPointerLeave, onKeyDown, onFocus, "data-slot": dataSlot = "menu-sub-trigger", ...restProps },
  forwardedRef,
) {
  const ctx = useMenuContext();
  const subCtx = useMenuSubContext();
  const dir = useDirection();
  const ref = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerEntryRef = useRef<{ x: number; y: number } | null>(null);
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
    if (disabled || event.pointerType !== "mouse") return;
    pointerEntryRef.current = { x: event.clientX, y: event.clientY };
    ctx.onHighlight(value);
    event.currentTarget.focus({ preventScroll: true });
  }, [ctx, disabled, value]);
  const handlePointerMove: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (disabled || event.pointerType !== "mouse" || hoverTimeoutRef.current !== undefined) return;
    const entry = pointerEntryRef.current;
    if (entry && event.clientX === entry.x && event.clientY === entry.y) return;
    hoverTimeoutRef.current = setTimeout(() => {
      hoverTimeoutRef.current = undefined;
      subCtx.onOpen();
    }, HOVER_DELAY);
  }, [disabled, subCtx.onOpen]);
  const handlePointerLeave: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse") return;
    pointerEntryRef.current = null;
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = undefined;
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
    onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onFocus: composeEventHandlers(onFocus, () => ctx.onHighlight(value)),
  };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "div", { ...behaviorProps, children });
});
