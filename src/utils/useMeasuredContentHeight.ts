"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  type RefObject,
} from "react";

const useSafeLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Keeps shared disclosure size hooks aligned with intrinsic content size. */
export function useMeasuredContentHeight(
  contentRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  content: unknown,
) {
  const measure = useCallback(() => {
    const element = contentRef.current;
    if (!element || !enabled) return;

    const height = `${element.scrollHeight}px`;
    const width = `${element.scrollWidth}px`;
    if (element.style.getPropertyValue("--content-height") !== height)
      element.style.setProperty("--content-height", height);
    if (element.style.getPropertyValue("--content-width") !== width)
      element.style.setProperty("--content-width", width);
  }, [contentRef, enabled]);

  useSafeLayoutEffect(() => {
    measure();
  }, [content, measure]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !enabled || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const view = element.ownerDocument.defaultView;
    if (!view) return undefined;
    let frame: number | undefined;
    let disposed = false;
    // Size variables can drive the observed element's animation. Commit outside
    // ResizeObserver delivery so that a style write cannot re-enter that batch.
    const observer = new ResizeObserver(() => {
      if (disposed || frame !== undefined) return;
      frame = view.requestAnimationFrame(() => {
        frame = undefined;
        if (!disposed && contentRef.current === element) measure();
      });
    });
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
      if (frame !== undefined) view.cancelAnimationFrame(frame);
    };
  }, [contentRef, enabled, measure]);
}
