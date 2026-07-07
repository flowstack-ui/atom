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
  "data-slot"?: string;
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
  "data-slot": dataSlot = "menu-radio-item",
  ...restProps
}: MenuRadioItemProps) {
  const ctx = useMenuContext();
  const radioCtx = useMenuRadioGroupContext();
  const ref = useRef<HTMLDivElement>(null);
  const itemValue = `${radioCtx.groupId}:${value}`;
  const isHighlighted = ctx.highlightedValue === itemValue;
  const isChecked = radioCtx.value === value;

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    radioCtx.onValueChange(value);
    ctx.onItemSelect(itemValue, { closeOnSelect });
  }, [closeOnSelect, ctx, disabled, itemValue, radioCtx, value]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (disabled) return;
    ctx.onHighlight(itemValue);
    if (ctx.openSubMenuId) ctx.onSubMenuClose();
  }, [ctx, disabled, itemValue]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    if (ctx.highlightedValue === itemValue) ctx.onHighlight(null);
  }, [ctx, itemValue]);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return undefined;
    ctx.registerItem(itemValue, element);
    return () => ctx.unregisterItem(itemValue);
  }, [ctx.registerItem, ctx.unregisterItem, disabled, itemValue]);

  useEffect(() => {
    if (disabled) return;
    ctx.registerLabel(itemValue, textValue ?? (typeof children === "string" ? children : value));
  }, [children, ctx.registerLabel, disabled, itemValue, textValue, value]);

  return (
    <div
      {...restProps}
      ref={ref}
      role="menuitemradio"
      tabIndex={-1}
      aria-checked={isChecked}
      aria-disabled={disabled || undefined}
      data-slot={dataSlot}
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
