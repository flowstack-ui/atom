"use client";

import { useEffect, useRef } from "react";
import type { SwipeableItemContextValue } from "./context.js";

/** Observe presentation-owned CSS motion; never animate a second numeric offset. */
export function useSwipeableItemMotion(value: SwipeableItemContextValue) {
  const { contentRef, offset, dragging, resetKey, motion, openSide, setSettling } = value;
  const target = value.disabled || value.readOnly ? 0 : value.getOffsetForSide(openSide);
  const callback = useRef(value.onSettle);
  callback.current = value.onSettle;
  const lastReset = useRef(resetKey);
  useEffect(() => {
    const element = contentRef.current;
    const win = element?.ownerDocument.defaultView;
    if (!element || !win) return;
    // The controller synchronizes the accepted target in an effect. Do not
    // report the previous offset with the newly accepted side in that commit.
    if (!dragging && offset !== target) return;
    let canceled = false;
    let frame = 0;
    const previousTransition = element.style.transitionProperty;
    const reduced = win.matchMedia?.("(prefers-reduced-motion: reduce)");
    const immediate = motion === "none" || !reduced || reduced.matches || resetKey !== lastReset.current;
    lastReset.current = resetKey;
    const finish = () => {
      if (canceled) return;
      canceled = true;
      setSettling(false);
      callback.current?.({ openSide, offset });
    };
    const skip = () => {
      if (!reduced?.matches && !immediate) return;
      element.style.transitionProperty = "none";
      // Flush the destination before restoring authored presentation.
      void element.getBoundingClientRect();
      finish();
    };
    if (dragging) {
      setSettling(false);
      return;
    }
    if (immediate) skip();
    else {
      frame = win.requestAnimationFrame(() => {
        if (canceled) return;
        void win.getComputedStyle(element).transform;
        const animations = element.getAnimations?.().filter((animation) =>
          "transitionProperty" in animation && animation.transitionProperty === "transform",
        ) ?? [];
        if (!animations.length) finish();
        else {
          setSettling(true);
          void Promise.all(animations.map((animation) => animation.finished)).then(finish, () => {
            // A replaced/canceled transition is not a completed settlement.
            if (!canceled) setSettling(false);
          });
        }
      });
    }
    reduced?.addEventListener("change", skip);
    return () => {
      canceled = true;
      win.cancelAnimationFrame(frame);
      reduced?.removeEventListener("change", skip);
      element.style.transitionProperty = previousTransition;
    };
  }, [contentRef, offset, target, dragging, resetKey, motion, openSide, setSettling]);
}
