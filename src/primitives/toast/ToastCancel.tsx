"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useToastRootContext } from "./context.js";

type ToastCancelNativeProps = NativeButtonProps<"children" | "type">;

export interface ToastCancelProps extends ToastCancelNativeProps {
  altText?: string;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ToastCancel = forwardRef<HTMLButtonElement, ToastCancelProps>(
  function ToastCancel(
    {
      altText,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast-cancel",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useToastRootContext();
    const cancel = context.toast?.cancel;
    const content = children ?? cancel?.label;

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      () => {
        cancel?.onClick();
        context.onDismiss();
      },
      [cancel, context],
    );

    if (content == null) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      "aria-label": altText,
      "data-slot": dataSlot,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children: content });
  },
);
