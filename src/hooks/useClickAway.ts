"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseClickAwayOptions {
  refs: RefObject<HTMLElement | null>[];
  onClickAway: (event: PointerEvent) => void;
  enabled?: boolean;
  ignore?: (target: Node) => boolean;
  /** Treat touch and pen outside interactions as taps instead of pointer starts. */
  deferTouch?: boolean;
}

const TAP_MOVEMENT_THRESHOLD = 8;

export function useClickAway({
  refs,
  onClickAway,
  enabled = false,
  ignore,
  deferTouch = false,
}: UseClickAwayOptions): void {
  const handlerRef = useRef(onClickAway);
  handlerRef.current = onClickAway;
  const ignoreRef = useRef(ignore);
  ignoreRef.current = ignore;

  useEffect(() => {
    if (!enabled) return undefined;

    let pendingPointer: {
      id: number;
      x: number;
      y: number;
    } | null = null;

    const clearPendingPointer = () => {
      pendingPointer = null;
    };

    const isOutside = (target: Node) => {
      for (const ref of refs) {
        if (ref.current && ref.current.contains(target)) return false;
      }
      return !ignoreRef.current?.(target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!isOutside(target)) return;

      if (deferTouch && (event.pointerType === "touch" || event.pointerType === "pen")) {
        pendingPointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        return;
      }

      handlerRef.current(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pendingPointer || event.pointerId !== pendingPointer.id) return;
      if (
        Math.hypot(
          event.clientX - pendingPointer.x,
          event.clientY - pendingPointer.y,
        ) > TAP_MOVEMENT_THRESHOLD
      ) {
        clearPendingPointer();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pendingPointer || event.pointerId !== pendingPointer.id) return;
      clearPendingPointer();
      handlerRef.current(event);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    if (deferTouch) {
      document.addEventListener("pointermove", handlePointerMove, true);
      document.addEventListener("pointerup", handlePointerUp, true);
      document.addEventListener("pointercancel", clearPendingPointer, true);
      document.addEventListener("scroll", clearPendingPointer, true);
      window.addEventListener("scroll", clearPendingPointer, true);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      if (deferTouch) {
        document.removeEventListener("pointermove", handlePointerMove, true);
        document.removeEventListener("pointerup", handlePointerUp, true);
        document.removeEventListener("pointercancel", clearPendingPointer, true);
        document.removeEventListener("scroll", clearPendingPointer, true);
        window.removeEventListener("scroll", clearPendingPointer, true);
      }
    };
  }, [deferTouch, enabled, refs]);
}
