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
import { leaveMenuItem } from "./pointer.js";
import { createMenuSelectionEvent, type MenuSelectionEvent } from "./options.js";

type MenuItemNativeProps = NativeDivProps<"children" | "role" | "onSelect">;

export interface MenuItemProps extends MenuItemNativeProps {
  value: string;
  textValue?: string;
  onSelect?: (event: MenuSelectionEvent) => void;
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
    onFocus,
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
    if (!element) return undefined;
    ctx.registerItem(value, element);
    return () => ctx.unregisterItem(value);
  }, [ctx.registerItem, ctx.unregisterItem, disabled, value]);

  useEffect(() => {
    ctx.registerLabel(value, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, textValue, value]);

  const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
    if (disabled) return;
    const selection = createMenuSelectionEvent(value, event.currentTarget, event.nativeEvent);
    onSelect?.(selection);
    ctx.dispatchSelect?.(selection);
    if (selection.defaultPrevented) return;
    const node = event.currentTarget;
    if (ctx.navigate && node.tagName === "A" && node.hasAttribute("href") && !node.hasAttribute("download") && (!node.getAttribute("target") || node.getAttribute("target") === "_self") && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      ctx.navigate({ value, node: node as HTMLAnchorElement, href: (node as HTMLAnchorElement).href, originalEvent: event.nativeEvent });
    }
    ctx.onItemSelect(value, { closeOnSelect });
  }, [closeOnSelect, ctx, disabled, onSelect, value]);

  const handlePointerEnter: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (event.pointerType !== "mouse") return;
    ctx.onHighlight(value);
    if (!ctx.controlledHighlight) event.currentTarget.focus({ preventScroll: true });
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, disabled, value]);

  const handlePointerLeave: PointerEventHandler<HTMLElement> = useCallback((event) => leaveMenuItem(event, ctx, value), [ctx, value]);

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
    onFocus: composeEventHandlers(onFocus, () => ctx.onHighlight(value)),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", { ...behaviorProps, children });
});
