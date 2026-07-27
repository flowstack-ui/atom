"use client";

import { useCallback, useEffect, type RefObject } from "react";

/** Keeps shared disclosure size hooks aligned with intrinsic content size. */
export function useMeasuredContentHeight(
  contentRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  content: unknown,
) {
  const measure = useCallback(() => {
    const element = contentRef.current;
    if (!element || !enabled) return;

    element.style.setProperty("--content-height", `${element.scrollHeight}px`);
    element.style.setProperty("--content-width", `${element.scrollWidth}px`);
  }, [contentRef, enabled]);

  useEffect(() => {
    measure();
  }, [content, measure]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !enabled || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [contentRef, enabled, measure]);
}
