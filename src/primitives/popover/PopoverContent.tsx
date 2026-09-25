"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import * as React from "react";
import { normalizePopoverAnchorRect } from "./anchor-rect.js";
import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from "react";
import {
  arrow as floatingArrow,
  offset,
  flip,
  shift,
  hide,
  size,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import {
  FOCUSABLE_SELECTOR,
  FocusScopeProvider,
  useCreateFocusScope,
  useFocusScopeContainer,
  useFocusTrap,
  focusFirstDescendant,
} from "../../hooks/focus.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { setModalLayerContent } from "../modal/layer.js";
import { useModalIsolation } from "../modal/useModalIsolation.js";
import { useDirection } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  getFloatingAvailableSizeMiddleware,
  getFloatingVisibilityMiddleware,
  resolveFloatingDirection,
} from "../../utils/floatingPlacement.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  PopoverContentContextProvider,
  usePopoverContext,
  type PopoverContentContextValue,
  type PopoverFinalFocusDetails,
  type PopoverInitialFocusDetails,
} from "./context.js";
import { getPopoverPartPresence, isPopoverPart } from "./parts.js";
import { getPopoverPointerInteractionType } from "./interaction.js";
import { DetachedLayerPolicyContext, useDetachedLayerPolicy } from "./detached-policy.js";

declare const process:
  | { env?: { NODE_ENV?: string } }
  | undefined;

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

type PopoverContentNativeProps = NativeDivProps<"children" | "role">;

const focusGuardStyle = {
  position: "fixed",
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: "none",
} as const;

const popoverFocusScopeMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

export interface PopoverContentProps extends PopoverContentNativeProps {
  asChild?: boolean;
  render?: RenderProp;
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  className?: string;
  initialFocus?: PopoverFocusTarget<PopoverInitialFocusDetails>;
  finalFocus?: PopoverFocusTarget<PopoverFinalFocusDetails>;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  "data-slot"?: string;
}

/** Internal adapter props, not part of the public Popover export. */
interface DetachedContentEvents {
  onFocusOutside?: (event: FocusEvent) => void;
}

export type PopoverFocusTarget<Details> =
  | RefObject<HTMLElement | null>
  | ((details: Details) => HTMLElement | null | false | undefined)
  | false;

function toPlacement(side: PopoverSide, align: PopoverAlign): Placement {
  if (align === "center") return side;
  return `${side}-${align === "start" ? "start" : "end"}`;
}

function sideFromPlacement(placement: Placement): PopoverSide {
  return placement.split("-")[0] as PopoverSide;
}

function focusWithoutScrolling(element: HTMLElement): void {
  element.focus({ preventScroll: true });
}

function resolveFocusTarget<Details>(
  target: PopoverFocusTarget<Details> | undefined,
  details: Details,
): HTMLElement | null | false | undefined {
  if (target === false || target === undefined) return target;
  if (typeof target === "function") return target(details);
  return target.current;
}

function isAvailableFocusTarget(target: HTMLElement): boolean {
  if (!target.isConnected) return false;
  if ("disabled" in target && target.disabled === true) return false;
  if (target.getAttribute("aria-disabled") === "true") return false;
  return !target.hidden && !target.closest("[hidden], [inert]");
}

function isRestorableFocusTarget(
  target: HTMLElement | null,
): target is HTMLElement {
  if (!target || !isAvailableFocusTarget(target)) return false;
  return target.tabIndex >= 0 || target.isContentEditable;
}

function focusNextElementAfterTrigger(
  trigger: HTMLElement,
  content: HTMLElement,
  guards: HTMLElement[],
): void {
  const focusableElements = Array.from(
    trigger.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  const triggerIndex = focusableElements.indexOf(trigger);

  if (triggerIndex === -1) return;

  for (let index = triggerIndex + 1; index < focusableElements.length; index += 1) {
    const candidate = focusableElements[index];

    if (candidate === trigger) continue;
    if (content.contains(candidate)) continue;
    if (guards.includes(candidate)) continue;

    focusWithoutScrolling(candidate);
    return;
  }

  trigger.blur();
}

function getPopoverReferenceElement(
  anchor: HTMLElement | null,
  trigger: HTMLElement | null,
): HTMLElement | null {
  if (!anchor) return trigger;

  const anchorStyle = anchor.ownerDocument.defaultView!.getComputedStyle(anchor);
  const child = anchor.firstElementChild;

  if (anchorStyle.display === "contents" && child?.nodeType === 1) {
    return child as HTMLElement;
  }

  return anchor;
}

function getElementFromNode(target: Node): Element | null {
  return target.nodeType === 1 ? target as Element : target.parentElement;
}

function getControlledLayerController(layer: HTMLElement): HTMLElement | null {
  if (!layer.id) return null;

  const controllers = Array.from(
    layer.ownerDocument.querySelectorAll<HTMLElement>("[aria-controls]"),
  );

  return controllers.find((controller) => (
    controller.getAttribute("aria-controls") === layer.id
  )) ?? null;
}

function getControlledLayerFromNode(target: Node): HTMLElement | null {
  let element = getElementFromNode(target);

  while (element) {
    if (
      "focus" in element &&
      getControlledLayerController(element as HTMLElement)
    ) {
      return element as HTMLElement;
    }

    element = element.parentElement;
  }

  return null;
}

function isInsideNestedControlledLayer(
  target: Node,
  ownerContent: HTMLElement | null,
): boolean {
  if (!ownerContent) return false;

  let layer = getControlledLayerFromNode(target);
  const visited = new Set<HTMLElement>();

  while (layer && layer !== ownerContent && !visited.has(layer)) {
    visited.add(layer);
    const controller = getControlledLayerController(layer);

    if (!controller) return false;
    if (ownerContent.contains(controller)) return true;

    layer = getControlledLayerFromNode(controller);
  }

  return false;
}

function hasOpenNestedControlledLayer(ownerContent: HTMLElement): boolean {
  const controllers = Array.from(
    ownerContent.querySelectorAll<HTMLElement>(
      "[aria-controls][aria-expanded='true']",
    ),
  );

  return controllers.some((controller) => {
    const controlledId = controller.getAttribute("aria-controls");
    if (!controlledId) return false;

    const controlledLayer = ownerContent.ownerDocument.getElementById(controlledId);
    // An expanded descendant may be awaiting its lazy portal/presence commit.
    // Its opening focus transaction is already owned before the host exists.
    return !controlledLayer || !ownerContent.contains(controlledLayer);
  });
}

export const PopoverContentImpl = forwardRef<HTMLDivElement, PopoverContentProps & DetachedContentEvents>(
function PopoverContent(props, ref) {
  const {
    children,
    asChild,
    render,
    side = "bottom",
    align = "center",
    sideOffset = 8,
    className,
    initialFocus,
    finalFocus,
    onInteractOutside,
    onFocusOutside,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledBy,
    "aria-describedby": nativeAriaDescribedBy,
    dir: dirProp,
    onMouseEnter,
    onMouseLeave,
    "data-slot": dataSlot = "popover-content",
    style,
    ...restProps
  } = props;
  const detached = useDetachedLayerPolicy();
  const {
    isOpen,
    onOpen,
    onClose,
    popoverId,
    triggerRef,
    anchorRef,
    modalLayer,
    modal,
    closeOnInteractOutside,
    triggerMode,
    titleId,
    descriptionId,
    titleCount,
    descriptionCount,
    partRegistryReady,
    initialFocusDetails,
    finalFocusDetails,
    positioning: p,
    lifecycle,
    outsideEvents,
    portalled,
    disabled,
    triggerValue,
    updateRef,
    isTriggerTarget,
  } = usePopoverContext();
  const contextDir = useDirection();
  const contentRef = useRef<HTMLDivElement>(null);
  const focusScope = useCreateFocusScope();
  const beforeGuardRef = useRef<HTMLSpanElement>(null);
  const afterGuardRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const [scheduledPresent, setScheduledPresent] = useState(isOpen);
  useEffect(() => {
    const win = contentRef.current?.ownerDocument.defaultView ?? triggerRef.current?.ownerDocument.defaultView ?? (typeof window !== "undefined" ? window : undefined);
    if (lifecycle.immediate || !win?.requestAnimationFrame) { setScheduledPresent(isOpen); return; }
    const frame = win.requestAnimationFrame(() => setScheduledPresent(isOpen));
    return () => win.cancelAnimationFrame(frame);
  }, [isOpen, lifecycle.immediate, triggerRef]);
  const desiredPresent = !disabled && (lifecycle.present ?? (lifecycle.immediate ? isOpen : scheduledPresent));
  const { isPresent, ref: presenceRef } = usePresence({ present: desiredPresent, onExitComplete: detached?.onExitComplete ?? lifecycle.onExitComplete });
  const initialOpen = useRef(isOpen);
  const transitioned = useRef(false);
  if (initialOpen.current !== isOpen) transitioned.current = true;
  const [hasOpened, setHasOpened] = useState(isOpen);
  useEffect(() => { if (isOpen) setHasOpened(true); }, [isOpen]);
  const mounting = detached ?? lifecycle;
  const keepMounted = Boolean(!mounting.unmountOnExit && hasOpened || !mounting.lazyMount && !hasOpened);
  // Exit animation may retain DOM, but closed content must leave tab navigation.
  // Setting the attribute works in React 18 as well as React 19.
  useLayoutEffect(() => {
    contentRef.current?.toggleAttribute("inert", !isOpen);
  });
  const composedChildren = asChild && React.isValidElement<{ children?: ReactNode }>(children) ? children.props.children : children;
  const visibleParts = getPopoverPartPresence(composedChildren);
  const childArray = Children.toArray(composedChildren);
  const arrowChildren = childArray.filter((child) => isPopoverPart(child, "arrow"));
  const viewportChildren = childArray.filter((child) => !isPopoverPart(child, "arrow"));
  const warnedRef = useRef(new Set<string>());
  const initialFocusRef = useRef(initialFocus);
  const finalFocusRef = useRef(finalFocus);
  const initialFocusDetailsRef = useRef(initialFocusDetails);
  const finalFocusDetailsRef = useRef(finalFocusDetails);
  const previousElementRef = useRef<HTMLElement | null>(null);
  const didMoveFocusRef = useRef(false);
  const initialFocusAppliedRef = useRef(false);
  initialFocusRef.current = initialFocus;
  finalFocusRef.current = finalFocus;
  initialFocusDetailsRef.current = initialFocusDetails;
  finalFocusDetailsRef.current = finalFocusDetails;

  const titlePresent = partRegistryReady
    ? titleCount > 0
    : visibleParts.title;
  const descriptionPresent = partRegistryReady
    ? descriptionCount > 0
    : visibleParts.description;
  const hasNativeName =
    nativeAriaLabel !== undefined || nativeAriaLabelledBy !== undefined;
  const resolvedAriaLabelledBy = hasNativeName
    ? nativeAriaLabelledBy
    : titlePresent
      ? titleId
      : undefined;
  const hasExplicitDescription = Object.prototype.hasOwnProperty.call(
    props,
    "aria-describedby",
  );
  const resolvedAriaDescribedBy = hasExplicitDescription
    ? nativeAriaDescribedBy
    : descriptionPresent
      ? descriptionId
      : undefined;

  useFocusScopeContainer(
    contentRef,
    isPresent,
    undefined,
    popoverFocusScopeMetadata,
  );
  useFocusScopeContainer(
    beforeGuardRef,
    isOpen && portalled && !modal && !detached,
    undefined,
    popoverFocusScopeMetadata,
  );
  useFocusScopeContainer(
    afterGuardRef,
    isOpen && portalled && !modal && !detached,
    undefined,
    popoverFocusScopeMetadata,
  );
  useFocusTrap(contentRef, isOpen && modal, { scope: focusScope });
  useFocusScopeContainer(contentRef, isOpen && modal, focusScope);
  useModalIsolation(modalLayer, focusScope, isOpen && modal);
  useScrollLock(isOpen && modal, contentRef);

  useLayoutEffect(() => {
    if (!isOpen || !isPresent) return undefined;

    const doc = contentRef.current?.ownerDocument ?? triggerRef.current?.ownerDocument;
    if (!doc) return;
    previousElementRef.current = doc.activeElement && "focus" in doc.activeElement
      ? doc.activeElement as HTMLElement
      : null;
    didMoveFocusRef.current = false;
    initialFocusAppliedRef.current = false;

    return () => {
      // Closing makes retained content inert before the microtask runs. Capture
      // ownership now so that browser-driven blur does not lose the return target.
      const closingActive = doc.activeElement;
      const closingOwnedFocus = Boolean(closingActive &&
        (contentRef.current?.contains(closingActive) || focusScope.contains(closingActive)));
      queueMicrotask(() => {
        const details = finalFocusDetailsRef.current;
        const content = contentRef.current;
        const activeElement = doc.activeElement && "focus" in doc.activeElement
          ? doc.activeElement as HTMLElement
          : null;
        const focusIsInside = Boolean(
          activeElement &&
          (content?.contains(activeElement) || focusScope.contains(activeElement)),
        );
        const preserveDestination =
          details.reason === "interactOutside" ||
          details.reason === "focusOutside" ||
          details.reason === "hoverLeave";

        if (preserveDestination) return;
        const blurredOnClose = closingOwnedFocus && (!activeElement || activeElement === doc.body);
        if (!didMoveFocusRef.current && !focusIsInside && !blurredOnClose) return;

        const explicitTarget = resolveFocusTarget(
          finalFocusRef.current,
          details,
        );
        if (explicitTarget === false) return;
        if (
          explicitTarget &&
          isAvailableFocusTarget(explicitTarget)
        ) {
          explicitTarget.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(triggerRef.current)) {
          triggerRef.current.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(previousElementRef.current)) {
          previousElementRef.current.focus({ preventScroll: true });
        }
      });
    };
  }, [focusScope, isOpen, isPresent, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen || !isPresent || initialFocusAppliedRef.current) return;
    const content = contentRef.current;
    if (!content) return;
    initialFocusAppliedRef.current = true;

    const details = initialFocusDetailsRef.current;
    if (details.reason === "triggerHover") return;
    if (
      content.contains(content.ownerDocument.activeElement) ||
      focusScope.contains(content.ownerDocument.activeElement)
    ) {
      return;
    }

    const explicitTarget = resolveFocusTarget(initialFocusRef.current, details);
    if (explicitTarget === false) return;
    if (
      explicitTarget &&
      isAvailableFocusTarget(explicitTarget) &&
      (content.contains(explicitTarget) || focusScope.contains(explicitTarget))
    ) {
      explicitTarget.focus({ preventScroll: true });
      didMoveFocusRef.current = true;
      return;
    }

    if (details.interactionType === "touch") {
      content.focus({ preventScroll: true });
      didMoveFocusRef.current = true;
      return;
    }

    focusFirstDescendant(content);
    didMoveFocusRef.current = true;
  }, [focusScope, isOpen, isPresent]);

  const clickAwayRefs = useMemo(
    () => [contentRef, triggerRef, anchorRef],
    [triggerRef, anchorRef],
  );

  useOutsideInteraction({
    refs: clickAwayRefs,
    onPointerDownOutside: outsideEvents.onPointerDownOutside,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      outsideEvents.onInteractOutside?.(event);
      if (!event.defaultPrevented && closeOnInteractOutside) {
        onClose(
          "interactOutside",
          getPopoverPointerInteractionType(event.pointerType),
        );
      }
    },
    enabled: isOpen,
    ignore: (target) => isInsideNestedControlledLayer(target, contentRef.current) ||
      isTriggerTarget(target) ||
      Boolean((detached?.persistentElements ?? outsideEvents.persistentElements)?.some((getElement) => getElement()?.contains(target))),
  });

  useLayoutEffect(() => {
    if (!detached || !isOpen || modal) return;
    const doc = contentRef.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    const handleFocus = (event: FocusEvent) => {
      const target = event.target;
      const content = contentRef.current;
      if (!target || !("nodeType" in target) || !content || content.contains(target as Node) ||
        isInsideNestedControlledLayer(target as Node, content) || hasOpenNestedControlledLayer(content) ||
        detached.persistentElements?.some((getElement) => getElement()?.contains(target as Node))) return;
      // A native focusin event is not cancelable. Give consumers an explicit
      // cancelable notification without canceling the browser's focus movement.
      const notification = new win.FocusEvent("focusoutside", { cancelable: true, relatedTarget: event.relatedTarget });
      Object.defineProperty(notification, "target", { value: target });
      onFocusOutside?.(notification);
      outsideEvents.onFocusOutside?.(notification);
      outsideEvents.onInteractOutside?.(notification);
      if (closeOnInteractOutside && !notification.defaultPrevented) onClose("focusOutside", "programmatic");
    };
    doc?.addEventListener("focusin", handleFocus);
    return () => doc?.removeEventListener("focusin", handleFocus);
  }, [detached, isOpen, isPresent, modal, closeOnInteractOutside, onClose, onFocusOutside, outsideEvents]);

  useEffect(() => {
    if (!isOpen || modal || detached) return undefined;

    const doc = contentRef.current?.ownerDocument ?? triggerRef.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    const requestAnimationFrame = win.requestAnimationFrame?.bind(win) ?? ((fn: FrameRequestCallback) => win.setTimeout(() => fn(Date.now()), 16));
    const cancelAnimationFrame = win.cancelAnimationFrame?.bind(win) ?? win.clearTimeout.bind(win);
    const notify = (target: EventTarget | null) => {
      if (target && "nodeType" in target && outsideEvents.persistentElements?.some(get => get()?.contains(target as Node))) return;
      const notification = new win.FocusEvent("focusoutside", { cancelable: true });
      Object.defineProperty(notification, "target", { value: target });
      onFocusOutside?.(notification);
      outsideEvents.onFocusOutside?.(notification);
      outsideEvents.onInteractOutside?.(notification);
      if (closeOnInteractOutside && !notification.defaultPrevented) onClose("focusOutside", "programmatic");
    };

    let focusOutFrame = 0;
    let focusSettleFrame = 0;

    const closeAfterFocusSettles = (
      content: HTMLElement,
      trigger: HTMLElement,
      beforeGuard: HTMLElement | null,
      afterGuard: HTMLElement | null,
    ) => {
      cancelAnimationFrame(focusOutFrame);
      cancelAnimationFrame(focusSettleFrame);
      focusOutFrame = requestAnimationFrame(() => {
        focusSettleFrame = requestAnimationFrame(() => {
          const activeElement = doc.activeElement;
          if (
            activeElement &&
            (content.contains(activeElement) ||
              isTriggerTarget(activeElement) ||
              isInsideNestedControlledLayer(activeElement, content) ||
              activeElement === beforeGuard ||
              activeElement === afterGuard)
          ) {
            return;
          }

          if (hasOpenNestedControlledLayer(content)) return;

          notify(activeElement);
        });
      });
    };

    const handleFocusOut = (event: FocusEvent) => {
      const content = contentRef.current;
      const trigger = triggerRef.current;
      const beforeGuard = beforeGuardRef.current;
      const afterGuard = afterGuardRef.current;
      const relatedTarget = event.relatedTarget as Node | null;

      if (!content || !trigger) return;
      if (hasOpenNestedControlledLayer(content)) return;
      if (
        !relatedTarget ||
        relatedTarget === doc.body ||
        relatedTarget === doc.documentElement
      ) {
        closeAfterFocusSettles(
          content,
          trigger,
          beforeGuard,
          afterGuard,
        );
        return;
      }

      if (
        !content.contains(relatedTarget) &&
        !isTriggerTarget(relatedTarget) &&
        !isInsideNestedControlledLayer(relatedTarget, content) &&
        relatedTarget !== beforeGuard &&
        relatedTarget !== afterGuard
      ) {
        notify(relatedTarget);
      }
    };

    const content = contentRef.current;
    content?.addEventListener("focusout", handleFocusOut);

    return () => {
      cancelAnimationFrame(focusOutFrame);
      cancelAnimationFrame(focusSettleFrame);
      content?.removeEventListener("focusout", handleFocusOut);
    };
  }, [detached, isOpen, modal, onClose, triggerRef, closeOnInteractOutside, onFocusOutside, outsideEvents, isTriggerTarget]);

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
            nativeAriaLabel === undefined &&
            resolvedAriaLabelledBy === undefined
          ) {
            warnings.set(
              "missing-name",
              "Popover content requires an accessible name. Render Popover.Title or provide native aria-label/aria-labelledby.",
            );
          }
          if (titleCount > 1) {
            warnings.set(
              "duplicate-title",
              "Popover content has multiple registered Title parts. Use one Title or an explicit native aria-labelledby relationship.",
            );
          }
          if (descriptionCount > 1) {
            warnings.set(
              "duplicate-description",
              "Popover content has multiple registered Description parts. Use one Description or an explicit native aria-describedby relationship.",
            );
          }

          for (const key of Array.from(warnedRef.current)) {
            if (!warnings.has(key)) warnedRef.current.delete(key);
          }
          for (const [key, message] of warnings) {
            if (warnedRef.current.has(key)) continue;
            warnedRef.current.add(key);
            console.warn(`[Atom Popover] ${message}`);
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
    nativeAriaLabel,
    resolvedAriaLabelledBy,
    titleCount,
  ]);

  const referenceElement = getPopoverReferenceElement(anchorRef.current, triggerRef.current);
  const resolvedDir = resolveFloatingDirection(dirProp, referenceElement, contextDir);
  const middleware = useMemo(() => {
    const collision = { boundary: typeof p?.boundary === "function" ? p.boundary() : p?.boundary, padding: p?.overflowPadding ?? 8 };
    return [
      p?.offset !== undefined ? offset(p.offset) : arrowOffset(arrowRef, p?.gutter ?? sideOffset, p?.shift ?? 0),
      ...(p ? [p.flip !== false && flip({ ...collision, fallbackPlacements: Array.isArray(p.flip) ? p.flip : undefined }), p.slide !== false && shift({ ...collision, crossAxis: p.overlap })] : getFloatingVisibilityMiddleware(side, align)),
      p?.sizeMiddleware !== false && getFloatingAvailableSizeMiddleware(),
      (p?.sameWidth || p?.fitViewport) && size({ ...collision, apply({ rects, availableWidth, availableHeight, elements }) {
        elements.floating.style.setProperty("--atom-popover-reference-width", `${rects.reference.width}px`);
        elements.floating.style.setProperty("--atom-popover-available-width", `${Math.max(0, availableWidth)}px`);
        elements.floating.style.setProperty("--atom-popover-available-height", `${Math.max(0, availableHeight)}px`);
      } }),
      p?.hideWhenDetached && hide(collision),
      floatingArrow({ element: arrowRef, padding: p?.arrowPadding ?? 8 }),
    ];
  }, [p, align, side, sideOffset]);

  const { refs, floatingStyles, placement, middlewareData, isPositioned, update } = useFloating({
    elements: { reference: detached ? null : referenceElement },
    placement: p?.placement ?? toPlacement(side, align),
    strategy: p?.strategy ?? "absolute",
    transform: false,
    middleware,
    whileElementsMounted: detached ? undefined : (reference, floating, update) => {
      if (p?.listeners === false) { update(); return () => {}; }
      return autoUpdateWithArrow(arrowRef)(reference, floating, update, { ...(typeof p?.listeners === "object" ? p.listeners : {}), ...(p?.animationFrame === undefined ? {} : { animationFrame: p.animationFrame }) });
    },
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  useEffect(() => {
    if (detached) return;
    const reference = getPopoverReferenceElement(anchorRef.current, triggerRef.current);
    refs.setPositionReference(p?.getAnchorElement?.() ?? (p?.getAnchorRect ? {
      contextElement: reference ?? undefined,
      getBoundingClientRect: () => {
        const rect = p.getAnchorRect?.() ?? reference?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
        return normalizePopoverAnchorRect(rect);
      },
    } : reference));
  }, [detached, p, triggerValue, isOpen, anchorRef, triggerRef, refs.setPositionReference]);
  useEffect(() => { updateRef.current = update; return () => { updateRef.current = null; }; }, [update, updateRef]);
  useEffect(() => { p?.onPositioned?.({ placed: isPositioned }); }, [isPositioned, p?.onPositioned]);

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, contentRef, presenceRef, ref),
    [presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      const cleanup = composedRef(node);
      setModalLayerContent(modalLayer, node);
      if (typeof cleanup === "function") return () => {
        cleanup();
        setModalLayerContent(modalLayer, null);
      };
    },
    [composedRef, modalLayer],
  );

  const actualSide = sideFromPlacement(placement);
  const arrowData = middlewareData.arrow;
  const hoverOpen: MouseEventHandler<HTMLDivElement> = useCallback(
    () => onOpen("triggerHover", "mouse"),
    [onOpen],
  );
  const hoverClose: MouseEventHandler<HTMLDivElement> = useCallback(
    () => onClose("hoverLeave", "mouse"),
    [onClose],
  );
  const handleBeforeGuardFocus = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    if (closeOnInteractOutside) onClose("focusOutside", "keyboard");
    focusWithoutScrolling(trigger);
  }, [onClose, triggerRef, closeOnInteractOutside]);
  const handleAfterGuardFocus = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    const beforeGuard = beforeGuardRef.current;
    const afterGuard = afterGuardRef.current;

    if (!trigger || !content) return;

    if (closeOnInteractOutside) onClose("focusOutside", "keyboard");
    focusNextElementAfterTrigger(
      trigger,
      content,
      [beforeGuard, afterGuard].filter(Boolean) as HTMLElement[],
    );
  }, [onClose, triggerRef, closeOnInteractOutside]);
  const contentContextValue: PopoverContentContextValue = useMemo(
    () => ({
      arrowRef,
      side: actualSide,
      arrowX: arrowData?.x,
      arrowY: arrowData?.y,
    }),
    [actualSide, arrowData?.x, arrowData?.y],
  );

  if (!isPresent && !keepMounted) return null;

  const panelChildren = <FocusScopeProvider scope={focusScope}>
    {detached ? <DetachedLayerPolicyContext.Provider value={null}>{composedChildren}</DetachedLayerPolicyContext.Provider> : <><div data-slot="popover-viewport">{viewportChildren}</div>{arrowChildren}</>}
  </FocusScopeProvider>;
  const attributes = {
    ...restProps, ref: setFloatingRef, id: popoverId, role: "dialog",
    dir: dirProp ?? resolvedDir, "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed", "data-side": detached ? undefined : actualSide,
    "data-placement": placement, "data-positioned": isPositioned ? "" : undefined,
    "data-initial-open": initialOpen.current && !transitioned.current && lifecycle.skipAnimationOnMount ? "" : undefined,
    hidden: !isPresent || restProps.hidden,
    "aria-hidden": !isOpen ? true : undefined,
    "aria-label": nativeAriaLabel, "aria-labelledby": resolvedAriaLabelledBy,
    "aria-describedby": resolvedAriaDescribedBy, "aria-modal": modal || undefined,
    tabIndex: -1, className,
    style: { ...style, ...(detached ? {} : floatingStyles),
      ...(p?.sameWidth ? { width: "var(--atom-popover-reference-width)" } : {}),
      ...(p?.fitViewport ? { maxWidth: "var(--atom-popover-available-width)", maxHeight: "var(--atom-popover-available-height)" } : {}),
      ...(middlewareData.hide?.referenceHidden ? { visibility: "hidden" as const } : {}),
      ...(!isPresent ? { display: "none" } : {}),
    },
    onMouseEnter: triggerMode === "hover" ? composeEventHandlers(onMouseEnter, hoverOpen) : onMouseEnter,
    onMouseLeave: triggerMode === "hover" ? composeEventHandlers(onMouseLeave, hoverClose) : onMouseLeave,
    children: panelChildren,
  };
  const panel = asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", attributes);
  const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: ReactNode }> }).Activity;

  return (
    <PopoverContentContextProvider value={contentContextValue}>
      {isOpen && portalled && !modal && !detached ? (
        <span
          ref={beforeGuardRef}
          aria-hidden="true"
          data-slot="popover-focus-guard"
          tabIndex={0}
          style={focusGuardStyle}
          onFocus={handleBeforeGuardFocus}
        />
      ) : null}
      {Activity && lifecycle.hideMode === "activity" ? <Activity mode={isPresent ? "visible" : "hidden"}>{panel}</Activity> : panel}
      {isOpen && portalled && !modal && !detached ? (
        <span
          ref={afterGuardRef}
          aria-hidden="true"
          data-slot="popover-focus-guard"
          tabIndex={0}
          style={focusGuardStyle}
          onFocus={handleAfterGuardFocus}
        />
      ) : null}
    </PopoverContentContextProvider>
  );
});

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(props, ref) { return <PopoverContentImpl {...props} ref={ref} />; },
);
