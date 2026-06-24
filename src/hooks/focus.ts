"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

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

export interface FocusScope {
  registerContainer: (container: HTMLElement) => () => void;
  contains: (target: Node | null) => boolean;
}

const FocusScopeContext = createContext<FocusScope | null>(null);
FocusScopeContext.displayName = "FocusScopeContext";

export function useCreateFocusScope(): FocusScope {
  const containersRef = useRef<Set<HTMLElement>>(new Set());

  return useMemo(
    () => ({
      registerContainer(container) {
        containersRef.current.add(container);

        return () => {
          containersRef.current.delete(container);
        };
      },
      contains(target) {
        if (!target) return false;

        for (const container of containersRef.current) {
          if (container.contains(target)) return true;
        }

        return false;
      },
    }),
    [],
  );
}

export function FocusScopeProvider({
  children,
  scope,
}: {
  children: ReactNode;
  scope: FocusScope;
}) {
  return createElement(FocusScopeContext.Provider, { value: scope }, children);
}

export function useFocusScopeContainer(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  scopeOverride?: FocusScope,
): void {
  const contextScope = useContext(FocusScopeContext);
  const scope = scopeOverride ?? contextScope;

  useEffect(() => {
    if (!enabled || !scope) return undefined;

    let unregister: (() => void) | undefined;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const registerWhenMounted = () => {
      if (cancelled || unregister) return;

      const container = containerRef.current;
      if (container) {
        unregister = scope.registerContainer(container);
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        frame = requestAnimationFrame(registerWhenMounted);
      }
    };

    frame = requestAnimationFrame(registerWhenMounted);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      unregister?.();
    };
  }, [containerRef, enabled, scope]);
}

function isFocusAllowed(
  container: HTMLElement,
  scope: FocusScope | undefined,
  target: Element | null,
): boolean {
  return Boolean(target && (container.contains(target) || scope?.contains(target)));
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  options: { scope?: FocusScope } = {},
): void {
  useEffect(() => {
    if (!enabled) return undefined;
    let restoreFrame = 0;

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

    const handleFocusIn = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const target = event.target instanceof Element ? event.target : null;
      if (isFocusAllowed(container, options.scope, target)) return;

      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(() => {
        const currentContainer = containerRef.current;
        const activeElement = document.activeElement;

        if (!currentContainer) return;
        if (
          isFocusAllowed(
            currentContainer,
            options.scope,
            activeElement instanceof Element ? activeElement : null,
          )
        ) {
          return;
        }

        focusFirstDescendant(currentContainer);
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      cancelAnimationFrame(restoreFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [containerRef, enabled, options.scope]);
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

    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const focusWhenMounted = () => {
      if (cancelled) return;

      if (ref.current) {
        focusFirstDescendant(ref.current);
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        frame = requestAnimationFrame(focusWhenMounted);
      }
    };

    frame = requestAnimationFrame(focusWhenMounted);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
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
