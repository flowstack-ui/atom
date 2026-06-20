"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { usePresence } from "../../hooks/usePresence.js";
import { useModalContext } from "../modal/context.js";
import { composeRefs } from "../../utils/slot.js";
import type { NativeDivProps } from "../../utils/dom.js";

type DrawerOverlayNativeProps = NativeDivProps;

export interface DrawerOverlayProps extends DrawerOverlayNativeProps {
  /** Disable backdrop click dismissal. */
  disabled?: boolean;
  /** Slot override for the backdrop overlay. */
  "data-slot"?: string;
}

export const DrawerOverlay = forwardRef<HTMLDivElement, DrawerOverlayProps>(
  function DrawerOverlay(
    {
      disabled = false,
      className,
      onClick,
      "data-slot": dataSlot = "drawer-overlay",
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
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (!disabled && closeOnBackdropClick) onClose("backdropClick");
        }}
        aria-hidden="true"
        data-slot={dataSlot}
        data-state={isOpen && isPositioned ? "open" : "closed"}
        {...(isPositioned ? { "data-positioned": "" } : {})}
      />
    );
  },
);
