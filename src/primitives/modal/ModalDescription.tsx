"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useModalContext } from "./context.js";
import { markModalPart } from "./parts.js";

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
    const { descriptionId, registerPart } = useModalContext();
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback(
      (node: HTMLParagraphElement | null) => {
        unregisterRef.current?.();
        unregisterRef.current = node ? registerPart("description") : null;
      },
      [registerPart],
    );
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );

    return (
      <p
        {...restProps}
        ref={composedRef}
        id={descriptionId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </p>
    );
  },
);

markModalPart(ModalDescription, "description");
