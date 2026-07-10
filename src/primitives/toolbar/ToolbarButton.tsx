"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEventHandler,
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
import { useToolbarItem } from "./useToolbarItem.js";

type ToolbarButtonNativeProps = NativeButtonProps<
  "children" | "disabled" | "onKeyDown" | "type"
>;

export interface ToolbarButtonProps extends ToolbarButtonNativeProps {
  /** Button content. */
  children?: ReactNode;
  /** Disable this button. */
  disabled?: boolean;
  /** Keyboard event handler. */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
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

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      children,
      disabled = false,
      onClick,
      className,
      ariaLabel,
      render,
      asChild,
      onFocus,
      onKeyDown,
      "data-slot": dataSlot = "toolbar-button",
      ...restProps
    },
    ref,
  ) {
    const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild
        ? childHasNativeButtonSemantics(children)
        : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (event.key !== " " && event.key !== "Enter") {
          onKeyDown?.(event as never);
          return;
        }

        if (disabled) {
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
      [disabled, onKeyDown],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      ...(isNativeButton ? { type: "button", disabled: disabled || undefined } : {}),
      ...(!hasNativeSemantics ? { role: "button" } : {}),
      tabIndex,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      ...(!isNativeButton && { "aria-disabled": disabled || undefined }),
      "data-slot": dataSlot,
      ...(disabled ? { "data-disabled": "" } : {}),
      className,
      onClick,
      onFocus: composeEventHandlers(onFocus, () => handleFocus()),
      onKeyDown: handleKeyDown,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
