"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  type FocusScope,
  focusFirstDescendant,
  useFocusScopeContainer,
  useFocusTrap,
} from "../../hooks/focus.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import {
  useModalContext,
  type ModalCloseReason,
  type ModalFinalFocusDetails,
  type ModalInitialFocusDetails,
} from "./context.js";
import type { ModalPartPresence } from "./parts.js";
import {
  isModalLayerScrollTarget,
  setModalLayerContent,
} from "./layer.js";
import { useModalIsolation } from "./useModalIsolation.js";

declare const process:
  | { env?: { NODE_ENV?: string } }
  | undefined;

const modalContentFocusMetadata = {
  focusContainment: "owned",
  tabParticipation: "modal-sequence",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

export type ModalFocusTarget<Details> =
  | RefObject<HTMLElement | null>
  | ((details: Details) => HTMLElement | null | false | undefined)
  | false;

export interface UseModalContentOptions {
  /** ARIA role for the content element. */
  role?: "dialog" | "alertdialog";
  /** Compatibility accessible label. Prefer native `aria-label`. */
  ariaLabel?: string;
  /** Native accessible label. Takes precedence over `ariaLabel`. */
  "aria-label"?: string;
  /** Native accessible-name relationship. Takes precedence over generated IDs. */
  "aria-labelledby"?: string;
  /** Native accessible-description relationship. Takes precedence over generated IDs. */
  "aria-describedby"?: string;
  /** Initial focus target. `false` disables automatic initial focus. */
  initialFocus?: ModalFocusTarget<ModalInitialFocusDetails>;
  /** Final focus target. `false` disables automatic focus restoration. */
  finalFocus?: ModalFocusTarget<ModalFinalFocusDetails>;
}

export interface UseModalContentReturn {
  /** Whether the content should render. */
  isPresent: boolean;
  /** Whether keep-mounted content is hidden. */
  isHidden: boolean;
  /** Whether the first positioning frame has completed. */
  isPositioned: boolean;
  /** Current data-state value for animation selectors. */
  dataState: "open" | "closed";
  /** Ref for the focus-trapped content wrapper. */
  wrapperRef: RefObject<HTMLDivElement | null>;
  /** Focus scope shared with portalled descendants owned by the modal. */
  focusScope: FocusScope;
  /** Callback ref for the presence-tracked element. */
  presenceRef: (node: HTMLDivElement | null) => void;
  /** ARIA and role props for the content element. */
  contentProps: {
    id: string;
    role: "dialog" | "alertdialog";
    "aria-modal": "true" | undefined;
    "aria-labelledby": string | undefined;
    "aria-describedby": string | undefined;
    "aria-label": string | undefined;
    "aria-hidden": "true" | undefined;
    inert: true | undefined;
    tabIndex: -1;
  };
  /** Close the modal, optionally with a reason. */
  onClose: (reason?: ModalCloseReason) => void;
  /** Whether backdrop click should close the modal. */
  closeOnBackdropClick: boolean;
}

function useModalContentImplementation(
  options: UseModalContentOptions,
  visibleParts: ModalPartPresence,
): UseModalContentReturn {
  const {
    role = "dialog",
    ariaLabel,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledBy,
    "aria-describedby": nativeAriaDescribedBy,
    initialFocus,
    finalFocus,
  } = options;
  const {
    isOpen,
    onClose,
    modalId,
    titleId,
    descriptionId,
    initialTitlePresent,
    initialDescriptionPresent,
    titleCount,
    descriptionCount,
    partRegistryReady,
    triggerRef,
    initialFocusDetails,
    finalFocusDetails,
    layer,
    isTopLayer,
    focusScope,
    closeOnEscape,
    closeOnBackdropClick,
    keepMounted,
  } = useModalContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const warnedRef = useRef(new Set<string>());
  const initialFocusRef = useRef(initialFocus);
  const initialFocusDetailsRef = useRef(initialFocusDetails);
  const finalFocusRef = useRef(finalFocus);
  const finalFocusDetailsRef = useRef(finalFocusDetails);
  const initialFocusAppliedRef = useRef(false);
  initialFocusRef.current = initialFocus;
  initialFocusDetailsRef.current = initialFocusDetails;
  finalFocusRef.current = finalFocus;
  finalFocusDetailsRef.current = finalFocusDetails;

  useLayoutEffect(() => {
    const content = wrapperRef.current;
    if (content && layer.overlay?.contains(content)) {
      throw new Error(
        "Modal-family Content must not be nested inside an aria-hidden Overlay. Render Overlay and Content as siblings.",
      );
    }
  }, [isPresent, layer]);

  const titlePresent = partRegistryReady
    ? titleCount > 0
    : initialTitlePresent || visibleParts.title;
  const descriptionPresent = partRegistryReady
    ? descriptionCount > 0
    : initialDescriptionPresent || visibleParts.description;
  const hasNativeName =
    nativeAriaLabel !== undefined || nativeAriaLabelledBy !== undefined;
  const resolvedAriaLabel = hasNativeName
    ? nativeAriaLabel
    : ariaLabel;
  const resolvedAriaLabelledBy = hasNativeName || ariaLabel !== undefined
    ? nativeAriaLabelledBy
    : titlePresent
      ? titleId
      : undefined;
  const hasExplicitDescription = Object.prototype.hasOwnProperty.call(
    options,
    "aria-describedby",
  );
  const resolvedAriaDescribedBy = hasExplicitDescription
    ? nativeAriaDescribedBy
    : descriptionPresent
      ? descriptionId
      : undefined;

  const isAllowedScrollTarget = useCallback(
    (target: Node) =>
      isModalLayerScrollTarget(layer, target) ||
      focusScope.isScrollAllowed(target),
    [focusScope, layer],
  );

  useFocusTrap(wrapperRef, isOpen && isTopLayer, { scope: focusScope });
  useModalIsolation(layer, focusScope, isOpen);
  useFocusScopeContainer(
    wrapperRef,
    isOpen,
    focusScope,
    modalContentFocusMetadata,
  );
  useScrollLock(isOpen, wrapperRef, isAllowedScrollTarget, isTopLayer);
  useDismissableLayer({
    enabled: isOpen && isTopLayer && closeOnEscape,
    onEscapeKeyDown: () => onClose("escapeKeyDown", "keyboard"),
  });

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const previousElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    return () => {
      queueMicrotask(() => {
        const target = resolveFocusTarget(
          finalFocusRef.current,
          finalFocusDetailsRef.current,
        );
        if (target === false) return;
        if (target instanceof HTMLElement && isAvailableFocusTarget(target)) {
          target.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(previousElement)) {
          previousElement.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(triggerRef.current)) {
          triggerRef.current.focus({ preventScroll: true });
        }
      });
    };
  }, [isOpen, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      initialFocusAppliedRef.current = false;
      return;
    }
    if (!isTopLayer || !isPresent || initialFocusAppliedRef.current) return;
    const container = wrapperRef.current;
    if (!container) return;
    initialFocusAppliedRef.current = true;
    if (
      container.contains(document.activeElement) ||
      focusScope.contains(document.activeElement)
    ) {
      return;
    }

    const target = resolveFocusTarget(
      initialFocusRef.current,
      initialFocusDetailsRef.current,
    );
    if (target === false) return;
    if (
      target instanceof HTMLElement &&
      isAvailableFocusTarget(target) &&
      (container.contains(target) || focusScope.contains(target))
    ) {
      target.focus({ preventScroll: true });
      return;
    }

    const autoFocusTarget = container.querySelector<HTMLElement>("[autofocus]");
    if (autoFocusTarget && isAvailableFocusTarget(autoFocusTarget)) {
      autoFocusTarget.focus({ preventScroll: true });
      return;
    }
    if (initialFocusDetailsRef.current.interactionType === "touch") {
      container.focus({ preventScroll: true });
      return;
    }
    focusFirstDescendant(container);
  }, [focusScope, isOpen, isPresent, isTopLayer, wrapperRef]);

  useEffect(() => {
    if (!partRegistryReady || !isOpen) return undefined;
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
      return undefined;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let settleFrame = 0;
    const frame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          const warnings = new Map<string, string>();
          if (
            resolvedAriaLabel === undefined &&
            resolvedAriaLabelledBy === undefined
          ) {
            warnings.set(
              "missing-name",
              "Modal content requires an accessible name. Render a Modal-family Title or provide native aria-label/aria-labelledby.",
            );
          }
          if (role === "alertdialog" && resolvedAriaDescribedBy === undefined) {
            warnings.set(
              "missing-alert-description",
              "AlertDialog content requires an accessible description. Render AlertDialog.Description or provide native aria-describedby.",
            );
          }
          if (titleCount > 1) {
            warnings.set(
              "duplicate-title",
              "Modal content has multiple registered Title parts. Use one Title or an explicit native aria-labelledby relationship.",
            );
          }
          if (descriptionCount > 1) {
            warnings.set(
              "duplicate-description",
              "Modal content has multiple registered Description parts. Use one Description or an explicit native aria-describedby relationship.",
            );
          }

          for (const key of Array.from(warnedRef.current)) {
            if (!warnings.has(key)) warnedRef.current.delete(key);
          }
          for (const [key, message] of warnings) {
            if (warnedRef.current.has(key)) continue;
            warnedRef.current.add(key);
            console.warn(`[Atom Modal] ${message}`);
          }
        }, 50);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settleFrame);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [
    descriptionCount,
    isOpen,
    partRegistryReady,
    resolvedAriaDescribedBy,
    resolvedAriaLabel,
    resolvedAriaLabelledBy,
    role,
    titleCount,
  ]);

  useEffect(() => {
    if (!isPresent) return undefined;

    setIsPositioned(false);
    const cleanupRef = { current: 0 };
    const frame = requestAnimationFrame(() => {
      cleanupRef.current = requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(cleanupRef.current);
    };
  }, [isPresent]);

  const isHidden = keepMounted && !isPresent;
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      setModalLayerContent(layer, node);
      presenceRef(node);
    },
    [layer, presenceRef],
  );

  return {
    isPresent: isPresent || keepMounted,
    isHidden,
    isPositioned,
    dataState: isOpen && isPositioned ? "open" : "closed",
    wrapperRef,
    focusScope,
    presenceRef: mergedRef,
    contentProps: {
      id: modalId,
      role,
      "aria-modal": isOpen ? "true" : undefined,
      "aria-labelledby": resolvedAriaLabelledBy,
      "aria-describedby": resolvedAriaDescribedBy,
      "aria-label": resolvedAriaLabel,
      "aria-hidden": isOpen ? undefined : "true",
      inert: isOpen ? undefined : true,
      tabIndex: -1,
    },
    onClose,
    closeOnBackdropClick,
  };
}

function resolveFocusTarget<Details>(
  target: ModalFocusTarget<Details> | undefined,
  details: Details,
): HTMLElement | null | false | undefined {
  if (target === false || target === undefined) return target;
  if (typeof target === "function") return target(details);
  return target.current;
}

function isRestorableFocusTarget(
  target: HTMLElement | null,
): target is HTMLElement {
  if (!target?.isConnected) return false;
  if ("disabled" in target && target.disabled === true) return false;
  if (target.getAttribute("aria-disabled") === "true") return false;
  if (target.hidden || target.closest("[hidden], [inert]")) return false;
  return target.tabIndex >= 0 || target.isContentEditable;
}

function isAvailableFocusTarget(target: HTMLElement): boolean {
  if (!target.isConnected) return false;
  if ("disabled" in target && target.disabled === true) return false;
  if (target.getAttribute("aria-disabled") === "true") return false;
  return !target.hidden && !target.closest("[hidden], [inert]");
}

export function useModalContent(
  options: UseModalContentOptions = {},
): UseModalContentReturn {
  return useModalContentImplementation(options, {
    title: false,
    description: false,
  });
}

/** @internal Supplies deterministic server-visible part hints to family Content. */
export function useModalContentWithParts(
  options: UseModalContentOptions,
  visibleParts: ModalPartPresence,
): UseModalContentReturn {
  return useModalContentImplementation(options, visibleParts);
}
