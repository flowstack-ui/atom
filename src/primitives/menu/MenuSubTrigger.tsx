"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { useDirection } from "../direction/index.js";
import { getMenuSubmenuOpenKey, useMenuContext, useMenuSubContext } from "./context.js";

const HOVER_DELAY = 100;

type MenuSubTriggerNativeProps = NativeDivProps<"children" | "role">;

export interface MenuSubTriggerProps extends MenuSubTriggerNativeProps {
  value: string;
  textValue?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  "data-slot"?: string;
}

export function MenuSubTrigger({
  value,
  textValue,
  disabled = false,
  className,
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  "data-slot": dataSlot = "menu-sub-trigger",
  ...restProps
}: MenuSubTriggerProps) {
  const ctx = useMenuContext();
  const subCtx = useMenuSubContext();
  const dir = useDirection();
  const ref = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (!subCtx) throw new Error("MenuSubTrigger must be used within <MenuSubRoot>");

  const isHighlighted = ctx.highlightedValue === value;

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return undefined;
    ctx.registerItem(value, element);
    subCtx.subTriggerRef.current = element;
    return () => ctx.unregisterItem(value);
  }, [ctx.registerItem, ctx.unregisterItem, disabled, subCtx.subTriggerRef, value]);

  useEffect(() => {
    if (disabled) return;
    ctx.registerLabel(value, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, disabled, textValue, value]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    ctx.onHighlight(value);
    hoverTimeoutRef.current = setTimeout(() => subCtx.onOpen(), HOVER_DELAY);
  }, [ctx, disabled, subCtx, value]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    if (ctx.highlightedValue === value) ctx.onHighlight(null);
  }, [ctx, value]);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (disabled) return;
      if (event.key === getMenuSubmenuOpenKey(dir)) {
        event.preventDefault();
        event.stopPropagation();
        subCtx.onOpen();
      }
    },
    [dir, disabled, subCtx],
  );

  useEffect(() => () => clearTimeout(hoverTimeoutRef.current), []);

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (!disabled) subCtx.onToggle();
  }, [disabled, subCtx]);

  return (
    <div
      {...restProps}
      ref={ref}
      id={subCtx.subTriggerId}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={subCtx.isOpen}
      aria-disabled={disabled || undefined}
      data-slot={dataSlot}
      data-state={subCtx.isOpen ? "open" : "closed"}
      data-highlighted={isHighlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      className={className}
      onClick={composeEventHandlers(onClick, handleClick)}
      onPointerEnter={composeEventHandlers(onPointerEnter, handlePointerEnter)}
      onPointerLeave={composeEventHandlers(onPointerLeave, handlePointerLeave)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    >
      {children}
    </div>
  );
}
