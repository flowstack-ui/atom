"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useToolbarToggleContext } from "./toggleContext.js";
import { useToolbarItem } from "./useToolbarItem.js";

type ToolbarToggleItemNativeProps = NativeButtonProps<
  "children" | "disabled" | "onChange" | "role" | "type" | "value"
>;

export interface ToolbarToggleItemProps extends ToolbarToggleItemNativeProps {
  /** Unique value identifier. */
  value: string;
  /** Toggle item content. */
  children?: ReactNode;
  /** Disable this item. */
  disabled?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Accessible label. */
  ariaLabel?: string;
}

export const ToolbarToggleItem = forwardRef<
  HTMLButtonElement,
  ToolbarToggleItemProps
>(function ToolbarToggleItem(
  {
    value,
    children,
    disabled = false,
    className,
    ariaLabel,
    onClick,
    onFocus,
    ...restProps
  },
  ref,
) {
  const toggleCtx = useToolbarToggleContext();
  const isDisabled = disabled || toggleCtx.disabled;
  const { itemRef, tabIndex, handleFocus } = useToolbarItem(isDisabled);
  const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);
  const isPressed = toggleCtx.value.includes(value);

  const handleClick = useCallback(
    (_event: MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        toggleCtx.onItemPress(value);
      }
    },
    [isDisabled, toggleCtx, value],
  );

  return (
    <button
      {...restProps}
      ref={composedRef}
      type="button"
      aria-pressed={isPressed}
      aria-label={ariaLabel}
      disabled={isDisabled}
      tabIndex={tabIndex}
      data-slot="toolbar-toggle-item"
      data-state={isPressed ? "on" : "off"}
      data-value={value}
      {...(isDisabled ? { "data-disabled": "" } : {})}
      className={className}
      onClick={composeEventHandlers(onClick, handleClick)}
      onFocus={composeEventHandlers(onFocus, () => handleFocus())}
    >
      {children}
    </button>
  );
});
