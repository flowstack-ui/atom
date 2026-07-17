"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePresence } from "../../hooks/usePresence.js";
import { useModalContext } from "../modal/context.js";
import { composeRefs } from "../../utils/slot.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { getModalPointerInteractionType } from "../modal/interaction.js";
import { setModalLayerOverlay } from "../modal/layer.js";

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
      onPointerDown,
      onPointerCancel,
      "data-slot": dataSlot = "drawer-overlay",
      ...restProps
    },
    ref,
  ) {
    const {
      isOpen,
      onClose,
      closeOnBackdropClick,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
      layer,
      isTopLayer,
    } = useModalContext();
    const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
    const [isPositioned, setIsPositioned] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const layerRef = useCallback(
      (node: HTMLDivElement | null) => setModalLayerOverlay(layer, node),
      [layer],
    );
    const composedRef = useMemo(
      () => composeRefs(presenceRef, layerRef, overlayRef, ref),
      [layerRef, presenceRef, ref],
    );

    useLayoutEffect(() => {
      if (
        overlayRef.current?.querySelector(
          '[role="dialog"], [role="alertdialog"]',
        )
      ) {
        throw new Error(
          "Modal-family Content must not be nested inside an aria-hidden Overlay. Render Overlay and Content as siblings.",
        );
      }
    });

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
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented) return;
          if (event.target !== event.currentTarget) return;
          recordInteraction(
            getModalPointerInteractionType(event.pointerType),
            event.currentTarget,
          );
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          if (event.defaultPrevented) return;
          clearInteraction(event.currentTarget);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.target !== event.currentTarget) {
            clearInteraction(event.currentTarget);
            return;
          }
          const interactionType = consumeInteraction(event.currentTarget);
          if (event.defaultPrevented) return;
          if (isTopLayer && !disabled && closeOnBackdropClick) {
            onClose("backdropClick", interactionType);
          }
        }}
        aria-hidden="true"
        data-slot={dataSlot}
        data-state={isOpen && isPositioned ? "open" : "closed"}
        {...(isPositioned ? { "data-positioned": "" } : {})}
      />
    );
  },
);
