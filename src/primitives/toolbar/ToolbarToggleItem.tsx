"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEventHandler,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  hasNativeButtonKeyboardActivation,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
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
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
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
    render,
    asChild,
    onClick,
    onFocus,
    onKeyDown,
    "data-slot": dataSlot = "toolbar-toggle-item",
    ...restProps
  },
  ref,
) {
  const toggleCtx = useToolbarToggleContext();
  const isDisabled = disabled || toggleCtx.disabled;
  const { itemRef, tabIndex, handleFocus } = useToolbarItem(isDisabled);
  const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);
  const isPressed = toggleCtx.value.includes(value);
  const isDefaultButton = !asChild && render === undefined;
  const hasNativeSemantics = isDefaultButton ||
    (asChild
      ? childHasNativeButtonSemantics(children)
      : renderHasNativeButtonSemantics(render));
  const isNativeButton = isDefaultButton ||
    (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));

  const handleClick = useCallback(
    (_event: MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        toggleCtx.onItemPress(value);
      }
    },
    [isDisabled, toggleCtx, value],
  );

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
    (event) => {
      if (event.key !== " " && event.key !== "Enter") {
        onKeyDown?.(event as never);
        return;
      }

      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onKeyDown?.(event as never);
      if (event.defaultPrevented) return;

      if (hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) {
        return;
      }

      event.preventDefault();
      event.currentTarget.click();
    },
    [isDisabled, onKeyDown],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    ...(isNativeButton ? { type: "button", disabled: isDisabled || undefined } : {}),
    ...(!hasNativeSemantics ? { role: "button" } : {}),
    "aria-pressed": isPressed,
    ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
    ...(!isNativeButton && { "aria-disabled": isDisabled || undefined }),
    tabIndex,
    "data-slot": dataSlot,
    "data-state": isPressed ? "on" : "off",
    "data-value": value,
    ...(isDisabled ? { "data-disabled": "" } : {}),
    className,
    onClick: composeEventHandlers(onClick, handleClick),
    onFocus: composeEventHandlers(onFocus, () => handleFocus()),
    onKeyDown: handleKeyDown,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return (
    renderElement(render, "button", { ...behaviorProps, children })
  );
});
