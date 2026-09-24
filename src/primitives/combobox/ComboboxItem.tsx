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
import { cloneAndMerge, renderElement, type RenderProp, composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

type ComboboxItemNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxItemProps extends ComboboxItemNativeProps {
  value: string;
  asChild?: boolean;
  render?: RenderProp;
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
      asChild = false,
      render,
      label,
      disabled: disabledProp,
      children,
      className,
      "data-slot": dataSlot = "combobox-item",
      onClick,
      onPointerDown,
      onPointerMove,
      onPointerLeave,
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const disabled = disabledProp || ctx.getOption(value)?.disabled || false;
    const internalRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const itemId = `${ctx.comboboxId}-option-${generatedId}`;
    const isSelected = ctx.multiple ? ctx.values.includes(value) : ctx.value === value;
    const isVisible = ctx.filteredOptions.some(option => option.value === value);
    const isHighlighted = ctx.highlightedValue === value;
    const { suppressNextInputFocusOpen } = ctx;

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
    }, [ctx.registerItem, ctx.unregisterItem, disabled, isVisible, itemId, value]);

    const handleClick: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
      if (disabled || ctx.disabled || ctx.readOnly) { event.preventDefault(); return; }
      suppressNextInputFocusOpen();
      const option = ctx.getOption(value) ?? { value, label, disabled };
      ctx.selectOption(option);
    }, [ctx.getOption, ctx.selectOption, ctx.disabled, ctx.readOnly, disabled, label, suppressNextInputFocusOpen, value]);

    const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (!disabled) suppressNextInputFocusOpen();
    }, [disabled, suppressNextInputFocusOpen]);

    const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (!disabled && ctx.highlightedValue !== value) ctx.onHighlight(value);
    }, [ctx.highlightedValue, ctx.onHighlight, disabled, value]);

    const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (ctx.highlightedValue === value) ctx.onHighlight(null);
    }, [ctx.highlightedValue, ctx.onHighlight, value]);

    if (!isVisible) return null;

    const itemProps = {
      ...restProps, ref: composedRef, id: itemId, role: "option",
      "aria-selected": isSelected, "aria-disabled": disabled || undefined,
      "data-slot": dataSlot, "data-state": isSelected ? "checked" : "unchecked",
      "data-highlighted": isHighlighted ? "" : undefined, "data-value": value,
      "data-disabled": disabled ? "" : undefined, className,
      onClick: composeEventHandlers(onClick, handleClick),
      onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
      onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
      onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
    };
    return asChild ? cloneAndMerge(children, itemProps) : renderElement(render, "div", { ...itemProps, children: children ?? label ?? value });
  },
);
