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
import { usePopoverContext } from "./context.js";

type PopoverCloseNativeProps = NativeButtonProps<"children" | "type">;

export interface PopoverCloseProps extends PopoverCloseNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
function PopoverClose(
  {
    children,
    asChild = false,
    render,
    "data-slot": dataSlot = "popover-close",
    onClick,
    ...restProps
  },
  ref,
) {
  const { onClose } = usePopoverContext();
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    onClose();
  }, [onClose]);
  const closeProps = {
    ...restProps,
    ref,
    "data-slot": dataSlot,
    onClick: composeEventHandlers(onClick, handleClick),
  };

  if (asChild) {
    return cloneAndMerge(children, closeProps);
  }

  return renderElement(render, "button", {
    ...closeProps,
    type: "button",
    children,
  });
});
