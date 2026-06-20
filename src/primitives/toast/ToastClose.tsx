"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useToastRootContext } from "./context.js";

type ToastCloseNativeProps = NativeButtonProps<"children" | "type">;

export interface ToastCloseProps extends ToastCloseNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  function ToastClose(
    {
      children,
      render,
      asChild,
      "aria-label": ariaLabel = "Dismiss notification",
      "data-slot": dataSlot = "toast-close",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useToastRootContext();

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      () => {
        context.onDismiss();
      },
      [context],
    );

    if (!context.closeButton || !context.dismissible) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
