"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

type ComboboxClearNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface ComboboxClearProps extends ComboboxClearNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const ComboboxClear = forwardRef<HTMLButtonElement, ComboboxClearProps>(
  function ComboboxClear(
    {
      children,
      asChild = false,
      render,
      "data-slot": dataSlot = "combobox-clear",
      onClick,
      onMouseDown,
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const hidden = !ctx.value || ctx.disabled || ctx.readOnly;
    const { clearSelection } = ctx;

    const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
      event.preventDefault();
    }, []);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
      (event) => {
        event.stopPropagation();
        if (!hidden) clearSelection();
      },
      [clearSelection, hidden],
    );

    const clearProps = {
      ...restProps,
      ref,
      type: "button",
      disabled: hidden || undefined,
      tabIndex: -1,
      "aria-hidden": hidden || undefined,
      "aria-label": restProps["aria-label"] ?? "Clear selection",
      "data-slot": dataSlot,
      "data-hidden": hidden ? "" : undefined,
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
    };

    if (asChild) return cloneAndMerge(children, clearProps);

    return renderElement(render, "button", {
      ...clearProps,
      children,
    });
  },
);
