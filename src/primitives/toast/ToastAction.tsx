"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useToastRootContext } from "./context.js";

type ToastActionNativeProps = NativeButtonProps<"children" | "type">;

export interface ToastActionProps extends ToastActionNativeProps {
  altText?: string;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>(
  function ToastAction(
    {
      altText,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast-action",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useToastRootContext();
    const action = context.toast?.action;
    const content = children ?? action?.label;

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      () => {
        action?.onClick();
        context.onDismiss();
      },
      [action, context],
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
