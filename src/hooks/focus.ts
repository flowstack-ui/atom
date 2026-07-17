"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useLayoutEffect,
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
  registerContainer: (
    container: HTMLElement,
    metadata?: FocusScopeContainerMetadata,
  ) => () => void;
  contains: (target: Node | null) => boolean;
  getContainerMetadata: (
    target: Node | null,
  ) => FocusScopeContainerMetadata | null;
  getContainers: () => Array<{
    container: HTMLElement;
    metadata: FocusScopeContainerMetadata;
  }>;
  isScrollAllowed: (target: Node | null) => boolean;
  getIsolationElements: () => HTMLElement[];
  subscribe: (subscriber: () => void) => () => void;
}

export interface FocusScopeContainerMetadata {
  focusContainment: "owned" | "top-layer" | "excluded";
  tabParticipation: "modal-sequence" | "delegate" | "none";
  scrollParticipation: "allowed" | "blocked";
  isolation: "owned" | "background";
}

const defaultFocusScopeContainerMetadata: FocusScopeContainerMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
};

const FocusScopeContext = createContext<FocusScope | null>(null);
FocusScopeContext.displayName = "FocusScopeContext";

export function useCreateFocusScope(): FocusScope {
  const containersRef = useRef<
    Map<HTMLElement, Map<symbol, FocusScopeContainerMetadata>>
  >(new Map());
  const subscribersRef = useRef<Set<() => void>>(new Set());

  const resolveMetadata = (
    registrations: Map<symbol, FocusScopeContainerMetadata>,
  ): FocusScopeContainerMetadata => {
    const values = Array.from(registrations.values());
    return {
      focusContainment: values.some(
        ({ focusContainment }) => focusContainment === "owned",
      )
        ? "owned"
        : values.some(
              ({ focusContainment }) => focusContainment === "top-layer",
            )
          ? "top-layer"
          : "excluded",
      tabParticipation: values.some(
        ({ tabParticipation }) => tabParticipation === "none",
      )
        ? "none"
        : values.some(
              ({ tabParticipation }) => tabParticipation === "delegate",
            )
          ? "delegate"
          : "modal-sequence",
      scrollParticipation: values.some(
        ({ scrollParticipation }) => scrollParticipation === "blocked",
      )
        ? "blocked"
        : "allowed",
      isolation: values.some(({ isolation }) => isolation === "owned")
        ? "owned"
        : "background",
    };
  };

  return useMemo(
    () => ({
      registerContainer(container, metadata = defaultFocusScopeContainerMetadata) {
        const registration = Symbol("focus-scope-registration");
        let registrations = containersRef.current.get(container);
        if (!registrations) {
          registrations = new Map();
          containersRef.current.set(container, registrations);
        }
        registrations.set(registration, metadata);
        for (const subscriber of subscribersRef.current) subscriber();

        return () => {
          const currentRegistrations = containersRef.current.get(container);
          if (!currentRegistrations?.delete(registration)) return;
          if (currentRegistrations.size === 0) {
            containersRef.current.delete(container);
          }
          for (const subscriber of subscribersRef.current) subscriber();
        };
      },
      contains(target) {
        if (!target) return false;

        for (const [container, registrations] of containersRef.current) {
          const metadata = resolveMetadata(registrations);
          if (
            metadata.focusContainment !== "excluded" &&
            container.contains(target)
          ) {
            return true;
          }
        }

        return false;
      },
      getContainerMetadata(target) {
        if (!target) return null;
        for (const [container, registrations] of containersRef.current) {
          if (container.contains(target)) return resolveMetadata(registrations);
        }
        return null;
      },
      getContainers() {
        return Array.from(
          containersRef.current,
          ([container, registrations]) => ({
            container,
            metadata: resolveMetadata(registrations),
          }),
        );
      },
      isScrollAllowed(target) {
        if (!target) return false;
        for (const [container, registrations] of containersRef.current) {
          const metadata = resolveMetadata(registrations);
          if (
            metadata.scrollParticipation === "allowed" &&
            container.contains(target)
          ) {
            return true;
          }
        }
        return false;
      },
      getIsolationElements() {
        return Array.from(containersRef.current)
          .filter(
            ([, registrations]) =>
              resolveMetadata(registrations).isolation === "owned",
          )
          .map(([container]) => container);
      },
      subscribe(subscriber) {
        subscribersRef.current.add(subscriber);
        return () => subscribersRef.current.delete(subscriber);
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
  metadata: FocusScopeContainerMetadata = defaultFocusScopeContainerMetadata,
): void {
  const contextScope = useContext(FocusScopeContext);
  const scope = scopeOverride ?? contextScope;

  useLayoutEffect(() => {
    if (!enabled || !scope) return undefined;

    let unregister: (() => void) | undefined;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const registerWhenMounted = () => {
      if (cancelled || unregister) return;

      const container = containerRef.current;
      if (container) {
        unregister = scope.registerContainer(container, metadata);
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        frame = requestAnimationFrame(registerWhenMounted);
      }
    };

    registerWhenMounted();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      unregister?.();
    };
  }, [containerRef, enabled, metadata, scope]);
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
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    let restoreFrame = 0;
    let lastFocusedInside: HTMLElement | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      const activeElement = document.activeElement;
      const activeMetadata = options.scope?.getContainerMetadata(activeElement);
      if (!container.contains(activeElement)) {
        if (!activeMetadata) return;
        if (activeMetadata.tabParticipation === "delegate") return;
        if (activeMetadata.tabParticipation === "none") {
          event.preventDefault();
          focusFirstDescendant(container);
          return;
        }
      }

      if (event.defaultPrevented) return;

      const tabContainers = [
        container,
        ...(options.scope?.getContainers()
          .filter(({ container: branch, metadata }) =>
            branch !== container &&
            metadata.focusContainment !== "excluded" &&
            metadata.tabParticipation === "modal-sequence")
          .map(({ container: branch }) => branch) ?? []),
      ];

      const focusableElements = Array.from(
        new Set(
          tabContainers.flatMap((tabContainer) =>
            getTabbableCandidates(tabContainer),
          ),
        ),
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
      if (isFocusAllowed(container, options.scope, target)) {
        lastFocusedInside = target instanceof HTMLElement ? target : null;
        return;
      }

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

        if (
          lastFocusedInside?.isConnected &&
          isFocusAllowed(currentContainer, options.scope, lastFocusedInside)
        ) {
          focusWithoutScrolling(lastFocusedInside);
        } else {
          focusFirstDescendant(currentContainer);
        }
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
  const autoFocusElement = getAutoFocusElement(container);
  const first = autoFocusElement && isTabbableCandidate(autoFocusElement)
    ? autoFocusElement
    : getTabbableCandidates(container)[0];
  focusWithoutScrolling(first ?? container);
}

function isTabbableCandidate(element: HTMLElement): boolean {
  if (!element.isConnected || element.tabIndex < 0) return false;
  if (element.hidden || element.closest("[hidden], [inert], [aria-hidden='true']")) {
    return false;
  }
  if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") {
    return false;
  }
  if (
    element.tagName === "INPUT" &&
    element.getAttribute("type")?.toLowerCase() === "hidden"
  ) {
    return false;
  }
  let current: HTMLElement | null = element;
  while (current) {
    const styles = getComputedStyle(current);
    if (
      styles.display === "none" ||
      styles.visibility === "hidden" ||
      styles.visibility === "collapse"
    ) {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isTabbableCandidate);
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

export function useFocusRestore(
  enabled: boolean,
  getRestoreElement?: () => HTMLElement | null,
): void {
  const previousElementRef = useRef<HTMLElement | null>(null);
  const getRestoreElementRef = useRef(getRestoreElement);
  getRestoreElementRef.current = getRestoreElement;

  useEffect(() => {
    if (!enabled) return undefined;

    previousElementRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const restoreElement =
        getRestoreElementRef.current?.() ?? previousElementRef.current;

      if (
        restoreElement &&
        document.contains(restoreElement)
      ) {
        focusWithoutScrolling(restoreElement);
      }
      previousElementRef.current = null;
    };
  }, [enabled]);
}
