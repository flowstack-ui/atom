"use client";

import { forwardRef, useCallback, useMemo, useRef } from "react";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useModalContext } from "../modal/context.js";
import { getModalPointerInteractionType } from "../modal/interaction.js";

export interface DialogPositionerProps extends NativeDivProps {
  /** Data slot identifier. */
  "data-slot"?: string;
}

/** An owned scroll boundary, separate from the aria-hidden scrim. */
export const DialogPositioner = forwardRef<HTMLDivElement, DialogPositionerProps>(
  function DialogPositioner({ onPointerDown, onPointerCancel, onClick, "data-slot": slot = "dialog-positioner", ...props }, ref) {
    const { registerBranch, isOpen, isTopLayer, closeOnBackdropClick, onClose, onInteractOutside,
      recordInteraction, consumeInteraction, clearInteraction } = useModalContext();
    const cleanup = useRef<(() => void) | null>(null);
    const register = useCallback((node: HTMLDivElement | null) => {
      cleanup.current?.();
      cleanup.current = node ? registerBranch(node) : null;
    }, [registerBranch]);
    const layerHostRef = useOverlayLayerHost();
    const composedRef = useMemo(() => composeRefs(register, layerHostRef, ref), [register, layerHostRef, ref]);
    return <div {...props} ref={composedRef} data-slot={slot} data-state={isOpen ? "open" : "closed"}
      onPointerDown={composeEventHandlers(onPointerDown, event => {
        if (event.target === event.currentTarget) recordInteraction(getModalPointerInteractionType(event.pointerType), event.currentTarget);
      })}
      onPointerCancel={composeEventHandlers(onPointerCancel, event => clearInteraction(event.currentTarget))}
      onClick={event => {
        onClick?.(event);
        if (event.target !== event.currentTarget) { clearInteraction(event.currentTarget); return; }
        const interaction = consumeInteraction(event.currentTarget);
        if (isOpen && isTopLayer && !event.defaultPrevented) onInteractOutside?.(event.nativeEvent);
        if (!event.defaultPrevented && !event.nativeEvent.defaultPrevented && isOpen && isTopLayer && closeOnBackdropClick) onClose("backdropClick", interaction);
      }} />;
  },
);
