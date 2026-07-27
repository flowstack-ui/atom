"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, type FocusEventHandler, type KeyboardEventHandler, type MouseEventHandler, type MutableRefObject, type PointerEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";
import { useMenubarContext, useMenubarMenuContext } from "./context.js";

type MenubarTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;
const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
export interface MenubarTriggerProps extends MenubarTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenubarTrigger = forwardRef<HTMLElement, MenubarTriggerProps>(function MenubarTrigger(
  { children, disabled = false, asChild = false, render, onClick, onPointerEnter, onFocus, onKeyDown, "data-slot": dataSlot = "menubar-trigger", ...restProps },
  forwardedRef,
) {
  const barCtx = useMenubarContext();
  const { menuValue } = useMenubarMenuContext();
  const menuCtx = useMenuContext();
  const triggerRef = useRef<HTMLElement>(null);
  const composedRef = useMemo(() => composeRefs(triggerRef, forwardedRef), [forwardedRef]);
  const isOpen = barCtx.openValue === menuValue;
  useSafeLayoutEffect(() => {
    const element = triggerRef.current;
    if (!element || disabled) return undefined;
    barCtx.registerTrigger(menuValue, element);
    return () => barCtx.unregisterTrigger(menuValue);
  }, [barCtx.registerTrigger, barCtx.unregisterTrigger, disabled, menuValue]);
  useSafeLayoutEffect(() => {
    (menuCtx.triggerRef as MutableRefObject<HTMLElement | null>).current = triggerRef.current;
    (menuCtx.ownerBoundaryRef as MutableRefObject<HTMLElement | null>).current = barCtx.rootRef.current;
  }, [barCtx.rootRef, menuCtx.ownerBoundaryRef, menuCtx.triggerRef]);
  const values = barCtx.getTriggerValues();
  const isFocused = barCtx.focusedValue === menuValue || (barCtx.focusedValue === null && values[0] === menuValue);
  const openFirst = useCallback(() => {
    menuCtx.onInitialHighlight("first");
    menuCtx.onHighlight(null);
    barCtx.onMenuOpen(menuValue);
  }, [barCtx, menuCtx, menuValue]);
  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled) return;
    if (isOpen) barCtx.onMenuClose();
    else openFirst();
  }, [barCtx, disabled, isOpen, openFirst]);
  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse" || disabled) return;
    if (barCtx.isAnyOpen && barCtx.openValue !== menuValue) {
      openFirst();
      event.currentTarget.focus({ preventScroll: true });
    }
  }, [barCtx.isAnyOpen, barCtx.openValue, disabled, menuValue, openFirst]);
  const handleFocus: FocusEventHandler<HTMLElement> = useCallback(() => barCtx.onFocus(menuValue), [barCtx, menuValue]);
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback((event) => {
    if (disabled) return;
    const horizontalPrevious = barCtx.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const horizontalNext = barCtx.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const triggerValues = barCtx.getTriggerValues();
      const targetValue = event.key === "Home" ? triggerValues[0] : triggerValues[triggerValues.length - 1];
      const target = targetValue ? barCtx.getTriggerElement(targetValue) : undefined;
      target?.focus({ preventScroll: true });
      if (targetValue) barCtx.onFocus(targetValue);
      if (targetValue && barCtx.isAnyOpen) barCtx.onMenuOpen(targetValue);
      return;
    }
    if (barCtx.orientation === "horizontal" && (event.key === horizontalPrevious || event.key === horizontalNext)) {
      event.preventDefault();
      barCtx.focusAdjacentTrigger(menuValue, event.key === horizontalNext ? "next" : "prev");
      return;
    }
    if (barCtx.orientation === "vertical" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      barCtx.focusAdjacentTrigger(menuValue, event.key === "ArrowDown" ? "next" : "prev");
      return;
    }
    if (event.key === "Enter" || event.key === " " || (barCtx.orientation === "horizontal" && (event.key === "ArrowDown" || event.key === "ArrowUp"))) {
      event.preventDefault();
      if ((event.key === "Enter" || event.key === " ") && isOpen) barCtx.onMenuClose();
      else {
        menuCtx.onInitialHighlight(event.key === "ArrowUp" ? "last" : "first");
        menuCtx.onHighlight(null);
        barCtx.onMenuOpen(menuValue);
      }
    }
  }, [barCtx, disabled, isOpen, menuCtx, menuValue]);
  const behaviorProps = {
    ...restProps,
    ref: composedRef,
    type: !asChild && !render ? "button" : undefined,
    role: "menuitem",
    id: menuCtx.triggerId,
    tabIndex: isFocused ? 0 : -1,
    disabled: !asChild && !render ? disabled || undefined : undefined,
    "aria-disabled": disabled || undefined,
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": menuCtx.menuId,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "data-disabled": disabled ? "" : undefined,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  };
  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "button", { ...behaviorProps, children });
});
