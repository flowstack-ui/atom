"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Keeps an uncontrolled custom form value in sync with native form reset. */
export function useFormReset(
  elementRef: RefObject<HTMLElement | null>,
  formId: string | undefined,
  controlled: boolean,
  reset: () => void,
): void {
  const resetRef = useRef(reset);
  const associatedFormRef = useRef<Element | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  resetRef.current = reset;
  useEffect(() => {
    const element = elementRef.current;
    const candidate = formId
      ? element?.ownerDocument.getElementById(formId)
      : element?.closest("form");
    const associatedForm = !controlled && candidate?.tagName === "FORM" ? candidate : null;
    if (associatedFormRef.current === associatedForm) return;
    cleanupRef.current?.();
    cleanupRef.current = undefined;
    associatedFormRef.current = associatedForm;
    if (!associatedForm) return;
    const view = associatedForm.ownerDocument.defaultView;
    if (!view) return undefined;
    const timers = new Set<number>();

    const handleReset = (event: Event) => {
      const timer = view.setTimeout(() => {
        timers.delete(timer);
        if (!event.defaultPrevented) resetRef.current();
      }, 0);
      timers.add(timer);
    };
    associatedForm.addEventListener("reset", handleReset);
    cleanupRef.current = () => {
      associatedForm.removeEventListener("reset", handleReset);
      for (const timer of timers) view.clearTimeout(timer);
    };
  });
  // Resolve after each commit so a controller can precede its RootProvider.
  // Keep one binding per actual form rather than restarting on callback changes.
  useEffect(() => () => {
    cleanupRef.current?.();
    cleanupRef.current = undefined;
    associatedFormRef.current = null;
  }, []);
}
