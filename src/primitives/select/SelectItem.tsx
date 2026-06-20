"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  SelectItemContextProvider,
  useSelectContext,
  type SelectItemContextValue,
} from "./context.js";

type SelectItemNativeProps = NativeDivProps<"children" | "role">;

export interface SelectItemProps extends SelectItemNativeProps {
  value: string;
  label?: string;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem(
    {
      value,
      label,
      children,
      disabled = false,
      className,
      onClick,
      onPointerMove,
      onPointerLeave,
      ...restProps
    },
    ref,
  ) {
    const ctx = useSelectContext();
    const internalRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const [hasItemText, setHasItemText] = useState(false);

    const isSelected = ctx.value === value;
    const isHighlighted = ctx.highlightedValue === value;
    const itemId = `${ctx.selectId}-option-${generatedId}`;
    const textId = `${itemId}-text`;

    const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);
    const textValue = label ?? (typeof children === "string" ? children : value);

    useEffect(() => {
      const el = internalRef.current;
      if (el) {
        ctx.registerItem(value, {
          id: itemId,
          element: el,
          disabled,
          textValue,
        });
        ctx.registerLabel(value, textValue);
      }
      return () => ctx.unregisterItem(value);
    }, [
      ctx.registerItem,
      ctx.registerLabel,
      ctx.unregisterItem,
      disabled,
      itemId,
      textValue,
      value,
    ]);

    const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
      if (disabled) return;
      ctx.onValueChange(value);
      ctx.triggerRef.current?.focus();
    }, [ctx.onValueChange, ctx.triggerRef, disabled, value]);

    const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (!disabled && ctx.highlightedValue !== value) {
        ctx.onHighlight(value);
      }
    }, [ctx.highlightedValue, ctx.onHighlight, disabled, value]);

    const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
      if (ctx.highlightedValue === value) {
        ctx.onHighlight(null);
      }
    }, [ctx.highlightedValue, ctx.onHighlight, value]);

    const registerText = useCallback(
      (nextTextValue: string) => {
        setHasItemText(true);
        ctx.registerLabel(value, nextTextValue);
        ctx.updateItemText(value, nextTextValue);
      },
      [ctx.registerLabel, ctx.updateItemText, value],
    );

    const itemContext = useMemo<SelectItemContextValue>(
      () => ({
        value,
        selected: isSelected,
        highlighted: isHighlighted,
        disabled,
        textId,
        hasItemText,
        registerText,
      }),
      [
        disabled,
        hasItemText,
        isHighlighted,
        isSelected,
        registerText,
        textId,
        value,
      ],
    );

    return (
      <SelectItemContextProvider value={itemContext}>
        <div
          {...restProps}
          ref={composedRef}
          id={itemId}
          role="option"
          aria-selected={isSelected}
          aria-disabled={disabled || undefined}
          aria-labelledby={hasItemText ? textId : undefined}
          data-slot="select-item"
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
      </SelectItemContextProvider>
    );
  },
);
