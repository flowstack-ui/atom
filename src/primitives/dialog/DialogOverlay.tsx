"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { usePresence } from "../../hooks/usePresence.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useModalContext } from "../modal/index.js";

type DialogOverlayNativeProps = NativeDivProps;

export interface DialogOverlayProps extends DialogOverlayNativeProps {
  /** Disable backdrop click dismissal for this overlay. */
  disabled?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay(
    {
      disabled = false,
      className,
      onClick,
      "data-slot": dataSlot = "dialog-overlay",
      ...restProps
    },
    ref,
  ) {
    const { isOpen, onClose, closeOnBackdropClick } = useModalContext();
    const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
    const [isPositioned, setIsPositioned] = useState(false);
    const composedRef = useMemo(
      () => composeRefs(presenceRef, ref),
      [presenceRef, ref],
    );

    useEffect(() => {
      if (!isPresent) return undefined;

      setIsPositioned(false);
      const cleanupRef = { current: 0 };
      const frame = requestAnimationFrame(() => {
        cleanupRef.current = requestAnimationFrame(() => {
          setIsPositioned(true);
        });
      });

      return () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(cleanupRef.current);
      };
    }, [isPresent]);

    if (!isPresent) return null;

    return (
      <div
        {...restProps}
        ref={composedRef}
        className={className}
        onClick={composeEventHandlers(onClick, () => {
          if (!disabled && closeOnBackdropClick) onClose("backdropClick");
        })}
        aria-hidden="true"
        data-slot={dataSlot}
        data-state={isOpen && isPositioned ? "open" : "closed"}
        {...(isPositioned ? { "data-positioned": "" } : {})}
      />
    );
  },
);
