"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { useMenuContext } from "./context.js";

type MenuItemNativeProps = NativeDivProps<"children" | "role">;

export interface MenuItemProps extends MenuItemNativeProps {
  value: string;
  textValue?: string;
  onSelect?: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  className?: string;
  children: ReactNode;
}

export function MenuItem({
  value,
  textValue,
  onSelect,
  disabled = false,
  closeOnSelect: closeOnSelectProp,
  className,
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restProps
}: MenuItemProps) {
  const ctx = useMenuContext();
  const ref = useRef<HTMLDivElement>(null);
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

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    onSelect?.();
    ctx.onItemSelect(value, { closeOnSelect });
    if (closeOnSelect) {
      ctx.triggerRef.current?.focus();
    }
  }, [closeOnSelect, ctx, disabled, onSelect, value]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    ctx.onHighlight(value);
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, disabled, value]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (ctx.highlightedValue === value) ctx.onHighlight(null);
  }, [ctx, value]);

  return (
    <div
      {...restProps}
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      data-slot="menu-item"
      data-highlighted={isHighlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      aria-disabled={disabled || undefined}
      className={className}
      onClick={composeEventHandlers(onClick, handleClick)}
      onPointerEnter={composeEventHandlers(onPointerEnter, handlePointerEnter)}
      onPointerLeave={composeEventHandlers(onPointerLeave, handlePointerLeave)}
    >
      {children}
    </div>
  );
}
