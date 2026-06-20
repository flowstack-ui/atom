"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { useModalContext } from "./context.js";

type ModalDescriptionNativeProps = NativeParagraphProps<"children">;

export interface ModalDescriptionProps extends ModalDescriptionNativeProps {
  /** Description content. */
  children: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Slot name for styling hooks. */
  "data-slot"?: string;
}

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(
  function ModalDescription(
    {
      children,
      className,
      "data-slot": dataSlot = "modal-description",
      ...restProps
    },
    ref,
  ) {
    const { descriptionId } = useModalContext();

    return (
      <p
        {...restProps}
        ref={ref}
        id={descriptionId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </p>
    );
  },
);
