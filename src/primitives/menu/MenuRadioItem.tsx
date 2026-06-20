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
import { useMenuContext, useMenuRadioGroupContext } from "./context.js";

type MenuRadioItemNativeProps = NativeDivProps<"children" | "role">;

export interface MenuRadioItemProps extends MenuRadioItemNativeProps {
  value: string;
  textValue?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  className?: string;
  children: ReactNode;
}

export function MenuRadioItem({
  value,
  textValue,
  disabled = false,
  closeOnSelect = false,
  className,
  children,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restProps
}: MenuRadioItemProps) {
  const ctx = useMenuContext();
  const radioCtx = useMenuRadioGroupContext();
  const ref = useRef<HTMLDivElement>(null);
  const isHighlighted = ctx.highlightedValue === value;
  const isChecked = radioCtx.value === value;

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    radioCtx.onValueChange(value);
    ctx.onItemSelect(value, { closeOnSelect });
  }, [closeOnSelect, ctx, disabled, radioCtx, value]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    ctx.onHighlight(value);
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, disabled, value]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (ctx.highlightedValue === value) ctx.onHighlight(null);
  }, [ctx, value]);

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

  return (
    <div
      {...restProps}
      ref={ref}
      role="menuitemradio"
      tabIndex={-1}
      aria-checked={isChecked}
      aria-disabled={disabled || undefined}
      data-slot="menu-radio-item"
      data-highlighted={isHighlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-checked={isChecked ? "" : undefined}
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
