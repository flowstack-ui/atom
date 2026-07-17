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
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useModalContext } from "../modal/index.js";
import { getModalPointerInteractionType } from "../modal/interaction.js";
import { setModalLayerOverlay } from "../modal/layer.js";

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
      onPointerDown,
      onPointerCancel,
      "data-slot": dataSlot = "dialog-overlay",
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
        onPointerDown={composeEventHandlers(onPointerDown, (event) => {
          if (event.target !== event.currentTarget) return;
          recordInteraction(
            getModalPointerInteractionType(event.pointerType),
            event.currentTarget,
          );
        })}
        onPointerCancel={composeEventHandlers(onPointerCancel, (event) => {
          clearInteraction(event.currentTarget);
        })}
        onClick={(event) => {
          onClick?.(event);
          if (event.target !== event.currentTarget) {
            clearInteraction(event.currentTarget);
            return;
          }
          const interactionType = consumeInteraction(event.currentTarget);
          if (
            !event.defaultPrevented &&
            isTopLayer &&
            !disabled &&
            closeOnBackdropClick
          ) {
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
