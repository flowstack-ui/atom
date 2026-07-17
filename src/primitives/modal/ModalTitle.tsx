"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeHeadingProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useModalContext } from "./context.js";
import { markModalPart } from "./parts.js";

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
    const { titleId, registerPart } = useModalContext();
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback(
      (node: HTMLHeadingElement | null) => {
        unregisterRef.current?.();
        unregisterRef.current = node ? registerPart("title") : null;
      },
      [registerPart],
    );
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );

    return (
      <Tag
        {...restProps}
        ref={composedRef}
        id={titleId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </Tag>
    );
  },
);

markModalPart(ModalTitle, "title");
