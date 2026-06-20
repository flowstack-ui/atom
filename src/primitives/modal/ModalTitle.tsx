"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeHeadingProps } from "../../utils/dom.js";
import { useModalContext } from "./context.js";

export type ModalHeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type ModalTitleNativeProps = NativeHeadingProps<"children">;

export interface ModalTitleProps extends ModalTitleNativeProps {
  /** Title content. */
  children: ReactNode;
  /** Heading level. */
  as?: ModalHeadingLevel;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Slot name for styling hooks. */
  "data-slot"?: string;
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  function ModalTitle(
    {
      children,
      as: Tag = "h2",
      className,
      "data-slot": dataSlot = "modal-title",
      ...restProps
    },
    ref,
  ) {
    const { titleId } = useModalContext();

    return (
      <Tag
        {...restProps}
        ref={ref}
        id={titleId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </Tag>
    );
  },
);
