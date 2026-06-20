"use client";

import { useEffect, type RefObject } from "react";

const allowedScrollRefs = new Set<RefObject<HTMLElement | null>>();
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";
let preventScrollHandler: ((event: WheelEvent) => void) | null = null;

function isAllowedScrollTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;

  for (const ref of allowedScrollRefs) {
    if (ref.current?.contains(target)) return true;
  }

  return false;
}

export function useScrollLock(
  enabled: boolean,
  allowRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!enabled) return undefined;

    if (allowRef) {
      allowedScrollRefs.add(allowRef);
    }

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      preventScrollHandler = (event: WheelEvent) => {
        if (isAllowedScrollTarget(event.target)) return;
        event.preventDefault();
      };

      document.addEventListener("wheel", preventScrollHandler, { passive: false });
    }

    lockCount += 1;

    return () => {
      if (allowRef) {
        allowedScrollRefs.delete(allowRef);
      }

      lockCount = Math.max(0, lockCount - 1);
      if (lockCount > 0) return;

      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      if (preventScrollHandler) {
        document.removeEventListener("wheel", preventScrollHandler);
        preventScrollHandler = null;
      }
    };
  }, [allowRef, enabled]);
}
