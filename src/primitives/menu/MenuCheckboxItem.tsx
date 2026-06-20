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

type MenuCheckboxItemNativeProps = NativeDivProps<"children" | "role">;

export interface MenuCheckboxItemProps extends MenuCheckboxItemNativeProps {
  value: string;
  textValue?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  className?: string;
  children: ReactNode;
}

export function MenuCheckboxItem({
  value,
  textValue,
  checked = false,
  onCheckedChange,
  disabled = false,
  closeOnSelect = false,
  className,
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restProps
}: MenuCheckboxItemProps) {
  const ctx = useMenuContext();
  const ref = useRef<HTMLDivElement>(null);
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
    onCheckedChange?.(!checked);
    ctx.onItemSelect(value, { closeOnSelect });
  }, [checked, closeOnSelect, ctx, disabled, onCheckedChange, value]);

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
      role="menuitemcheckbox"
      tabIndex={-1}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-slot="menu-checkbox-item"
      data-highlighted={isHighlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-checked={checked ? "" : undefined}
      data-value={value}
      className={className}
      onClick={composeEventHandlers(onClick, handleClick)}
      onPointerEnter={composeEventHandlers(onPointerEnter, handlePointerEnter)}
      onPointerLeave={composeEventHandlers(onPointerLeave, handlePointerLeave)}
    >
      {children}
    </div>
  );
}
