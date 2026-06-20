"use client";

import { useEffect, useRef, type RefObject } from "react";

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function focusWithoutScrolling(element: HTMLElement): void {
  element.focus({ preventScroll: true });
}

function getAutoFocusElement(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[autofocus]");
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(document.activeElement)) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        focusWithoutScrolling(container);
        return;
      }

      event.preventDefault();

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      );
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusableElements.length - 1
          : currentIndex - 1
        : currentIndex === -1 || currentIndex >= focusableElements.length - 1
          ? 0
          : currentIndex + 1;

      focusWithoutScrolling(focusableElements[nextIndex]);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, enabled]);
}

export function focusFirstDescendant(container: HTMLElement): void {
  const first =
    getAutoFocusElement(container) ??
    container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  focusWithoutScrolling(first ?? container);
}

export function useFocusOnMount(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return undefined;

    if (ref.current) {
      focusFirstDescendant(ref.current);
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      if (ref.current) focusFirstDescendant(ref.current);
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, ref]);
}

export function useFocusRestore(enabled: boolean): void {
  const previousElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    previousElementRef.current = document.activeElement as HTMLElement | null;

    return () => {
      if (
        previousElementRef.current &&
        document.contains(previousElementRef.current)
      ) {
        focusWithoutScrolling(previousElementRef.current);
      }
      previousElementRef.current = null;
    };
  }, [enabled]);
}
