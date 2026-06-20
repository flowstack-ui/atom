"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useInputContext } from "./context.js";

type InputClearNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "type"
>;

export interface InputClearProps extends InputClearNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  onClear?: () => void;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "data-slot"?: string;
}

export const InputClear = forwardRef<HTMLButtonElement, InputClearProps>(
  function InputClear(
    {
      children,
      render,
      asChild,
      onClick,
      onClear,
      onMouseDown,
      "aria-label": ariaLabel = "Clear input",
      "data-slot": dataSlot = "input-clear",
      ...restProps
    },
    ref,
  ) {
    const ctx = useInputContext();
    const isDisabled = ctx.disabled || ctx.readOnly;
    const hidden = ctx.value === "" || isDisabled;
    const { clearValue } = ctx;

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
      if (hidden) return;
      clearValue();
      onClear?.();
    }, [clearValue, hidden, onClear]);

    const handleMouseDown = useCallback<MouseEventHandler<HTMLButtonElement>>(
      (event) => {
        event.preventDefault();
      },
      [],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: hidden || undefined,
      tabIndex: -1,
      "aria-hidden": hidden || undefined,
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      ...(isDisabled && { "data-disabled": "" }),
      ...(hidden && { "data-hidden": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);
