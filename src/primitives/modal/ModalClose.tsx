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
import { useModalContext } from "./context.js";

type ModalCloseNativeProps = NativeButtonProps<"children" | "type">;

export interface ModalCloseProps extends ModalCloseNativeProps {
  /** Close control content. */
  children: ReactNode;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ModalClose = forwardRef<HTMLElement, ModalCloseProps>(
  function ModalClose(
    {
      children,
      asChild = false,
      render,
      onClick,
      "data-slot": dataSlot = "modal-close",
      ...restProps
    },
    ref,
  ) {
    const { onClose } = useModalContext();

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
      onClose("closeClick");
    }, [onClose]);

    const behaviorProps = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
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
