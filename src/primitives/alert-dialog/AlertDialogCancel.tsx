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
import { useModalContext } from "../modal/index.js";

type AlertDialogCancelNativeProps = NativeButtonProps<"children" | "type">;

export interface AlertDialogCancelProps extends AlertDialogCancelNativeProps {
  /** Cancel control content. */
  children: ReactNode;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AlertDialogCancel = forwardRef<HTMLElement, AlertDialogCancelProps>(
  function AlertDialogCancel(
    {
      children,
      asChild = false,
      render,
      onClick,
      autoFocus = true,
      "data-slot": dataSlot = "alert-dialog-cancel",
      ...restProps
    },
    ref,
  ) {
    const { onClose } = useModalContext();

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
      onClose("cancelClick");
    }, [onClose]);

    const behaviorProps = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      autoFocus,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      type: "button",
      children,
    });
  },
);
