"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

type ComboboxItemNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxItemProps extends ComboboxItemNativeProps {
  value: string;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(
    {
      value,
      label,
      disabled = false,
      children,
      className,
      "data-slot": dataSlot = "combobox-item",
      onClick,
      onPointerMove,
      onPointerLeave,
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const internalRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const itemId = `${ctx.comboboxId}-option-${generatedId}`;
    const isSelected = ctx.value === value;
    const isHighlighted = ctx.highlightedValue === value;

    const composedRef = useMemo(() => composeRefs(internalRef, ref), [internalRef, ref]);

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return undefined;

      ctx.registerItem(value, {
        id: itemId,
        element,
        disabled,
      });
      return () => ctx.unregisterItem(value);
    }, [ctx.registerItem, ctx.unregisterItem, disabled, itemId, value]);

    const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
      if (disabled) return;
      const option = ctx.getOption(value) ?? { value, label, disabled };
      ctx.selectOption(option);
    }, [ctx.getOption, ctx.selectOption, disabled, label, value]);

    const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (!disabled && ctx.highlightedValue !== value) ctx.onHighlight(value);
    }, [ctx.highlightedValue, ctx.onHighlight, disabled, value]);

    const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (ctx.highlightedValue === value) ctx.onHighlight(null);
    }, [ctx.highlightedValue, ctx.onHighlight, value]);

    return (
      <div
        {...restProps}
        ref={composedRef}
        id={itemId}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        data-slot={dataSlot}
        data-state={isSelected ? "checked" : "unchecked"}
        data-highlighted={isHighlighted ? "" : undefined}
        data-value={value}
        data-disabled={disabled ? "" : undefined}
        className={className}
        onClick={composeEventHandlers(onClick, handleClick)}
        onPointerMove={composeEventHandlers(onPointerMove, handlePointerMove)}
        onPointerLeave={composeEventHandlers(onPointerLeave, handlePointerLeave)}
      >
        {children ?? label ?? value}
      </div>
    );
  },
);
