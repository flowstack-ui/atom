"use client";

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
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { useClickAway } from "../../hooks/useClickAway.js";
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
import { useDirection } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  getFloatingAvailableSizeMiddleware,
  getFloatingFallbackPlacements,
  resolveFloatingDirection,
} from "../../utils/floatingPlacement.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  PopoverContentContextProvider,
  usePopoverContext,
  type PopoverContentContextValue,
  type PopoverFinalFocusDetails,
  type PopoverInitialFocusDetails,
} from "./context.js";
import { getPopoverPartPresence, isPopoverPart } from "./parts.js";
import { getPopoverPointerInteractionType } from "./interaction.js";

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
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  className?: string;
  initialFocus?: PopoverFocusTarget<PopoverInitialFocusDetails>;
  finalFocus?: PopoverFocusTarget<PopoverFinalFocusDetails>;
  "data-slot"?: string;
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
    document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
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

  const anchorStyle = window.getComputedStyle(anchor);
  const child = anchor.firstElementChild;

  if (anchorStyle.display === "contents" && child instanceof HTMLElement) {
    return child;
  }

  return anchor;
}

function getElementFromNode(target: Node): Element | null {
  return target instanceof Element ? target : target.parentElement;
}

function getPopoverController(layer: HTMLElement): HTMLElement | null {
  if (!layer.id) return null;

  const controllers = Array.from(
    document.querySelectorAll<HTMLElement>("[aria-controls]"),
  );

  return controllers.find((controller) => (
    controller.getAttribute("aria-controls") === layer.id
  )) ?? null;
}

function isInsideNestedPopoverLayer(
  target: Node,
  ownerContent: HTMLElement | null,
): boolean {
  if (!ownerContent) return false;

  let layer = getElementFromNode(target)?.closest<HTMLElement>("[role='dialog'][id]");

  while (layer && layer !== ownerContent) {
    const controller = getPopoverController(layer);

    if (!controller) return false;
    if (ownerContent.contains(controller)) return true;

    layer = controller.closest<HTMLElement>("[role='dialog'][id]");
  }

  return false;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
function PopoverContent(props, ref) {
  const {
    children,
    side = "bottom",
    align = "center",
    sideOffset = 8,
    className,
    initialFocus,
    finalFocus,
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
  const {
    isOpen,
    onOpen,
    onClose,
    popoverId,
    triggerRef,
    anchorRef,
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
  } = usePopoverContext();
  const contextDir = useDirection();
  const contentRef = useRef<HTMLDivElement>(null);
  const focusScope = useCreateFocusScope();
  const beforeGuardRef = useRef<HTMLSpanElement>(null);
  const afterGuardRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const visibleParts = getPopoverPartPresence(children);
  const childArray = Children.toArray(children);
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
    isPresent && !modal,
    undefined,
    popoverFocusScopeMetadata,
  );
  useFocusScopeContainer(
    afterGuardRef,
    isPresent && !modal,
    undefined,
    popoverFocusScopeMetadata,
  );
  useFocusTrap(contentRef, isOpen && modal, { scope: focusScope });
  useFocusScopeContainer(contentRef, isOpen && modal, focusScope);
  useScrollLock(isOpen && modal, contentRef);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    previousElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    didMoveFocusRef.current = false;
    initialFocusAppliedRef.current = false;

    return () => {
      queueMicrotask(() => {
        const details = finalFocusDetailsRef.current;
        const content = contentRef.current;
        const activeElement = document.activeElement instanceof HTMLElement
          ? document.activeElement
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
        if (!didMoveFocusRef.current && !focusIsInside) return;

        const explicitTarget = resolveFocusTarget(
          finalFocusRef.current,
          details,
        );
        if (explicitTarget === false) return;
        if (
          explicitTarget instanceof HTMLElement &&
          isAvailableFocusTarget(explicitTarget)
        ) {
          explicitTarget.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(previousElementRef.current)) {
          previousElementRef.current.focus({ preventScroll: true });
          return;
        }
        if (isRestorableFocusTarget(triggerRef.current)) {
          triggerRef.current.focus({ preventScroll: true });
        }
      });
    };
  }, [focusScope, isOpen, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen || !isPresent || initialFocusAppliedRef.current) return;
    const content = contentRef.current;
    if (!content) return;
    initialFocusAppliedRef.current = true;

    const details = initialFocusDetailsRef.current;
    if (details.reason === "triggerHover") return;
    if (
      content.contains(document.activeElement) ||
      focusScope.contains(document.activeElement)
    ) {
      return;
    }

    const explicitTarget = resolveFocusTarget(initialFocusRef.current, details);
    if (explicitTarget === false) return;
    if (
      explicitTarget instanceof HTMLElement &&
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

  useEffect(() => {
    if (!isPresent) return undefined;
    setIsPositioned(false);
    const raf = requestAnimationFrame(() => setIsPositioned(true));
    return () => cancelAnimationFrame(raf);
  }, [isPresent]);

  const clickAwayRefs = useMemo(
    () => [contentRef, triggerRef, anchorRef],
    [triggerRef, anchorRef],
  );

  useClickAway({
    refs: clickAwayRefs,
    onClickAway: (event) => onClose(
      "interactOutside",
      getPopoverPointerInteractionType(event.pointerType),
    ),
    enabled: isOpen && closeOnInteractOutside,
    ignore: (target) => isInsideNestedPopoverLayer(target, contentRef.current),
    deferTouch: true,
  });

  useEffect(() => {
    if (!isOpen || modal) return undefined;

    const handleFocusOut = (event: FocusEvent) => {
      const content = contentRef.current;
      const trigger = triggerRef.current;
      const beforeGuard = beforeGuardRef.current;
      const afterGuard = afterGuardRef.current;
      const relatedTarget = event.relatedTarget as Node | null;

      if (!content || !trigger) return;
      if (
        !relatedTarget ||
        (!content.contains(relatedTarget) &&
          !trigger.contains(relatedTarget) &&
          !isInsideNestedPopoverLayer(relatedTarget, content) &&
          relatedTarget !== beforeGuard &&
          relatedTarget !== afterGuard)
      ) {
        onClose("focusOutside", "programmatic");
      }
    };

    const content = contentRef.current;
    content?.addEventListener("focusout", handleFocusOut);

    return () => {
      content?.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen, modal, onClose, triggerRef]);

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
  const middleware = useMemo(
    () => [
      offset(sideOffset),
      flip({
        fallbackPlacements: getFloatingFallbackPlacements(side, align),
        fallbackStrategy: "bestFit",
      }),
      shift({ padding: 8 }),
      getFloatingAvailableSizeMiddleware(),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    [align, side, sideOffset],
  );

  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    middleware,
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  useEffect(() => {
    refs.setReference(getPopoverReferenceElement(anchorRef.current, triggerRef.current));
  });

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, contentRef, presenceRef, ref),
    [presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
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

    onClose("focusOutside", "keyboard");
    focusWithoutScrolling(trigger);
  }, [onClose, triggerRef]);
  const handleAfterGuardFocus = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    const beforeGuard = beforeGuardRef.current;
    const afterGuard = afterGuardRef.current;

    if (!trigger || !content) return;

    onClose("focusOutside", "keyboard");
    focusNextElementAfterTrigger(
      trigger,
      content,
      [beforeGuard, afterGuard].filter(Boolean) as HTMLElement[],
    );
  }, [onClose, triggerRef]);
  const contentContextValue: PopoverContentContextValue = useMemo(
    () => ({
      arrowRef,
      side: actualSide,
      arrowX: arrowData?.x,
      arrowY: arrowData?.y,
    }),
    [actualSide, arrowData?.x, arrowData?.y],
  );

  if (!isPresent) return null;

  return (
    <PopoverContentContextProvider value={contentContextValue}>
      {!modal ? (
        <span
          ref={beforeGuardRef}
          aria-hidden="true"
          data-slot="popover-focus-guard"
          tabIndex={0}
          style={focusGuardStyle}
          onFocus={handleBeforeGuardFocus}
        />
      ) : null}
      <div
        {...restProps}
        ref={setFloatingRef}
        id={popoverId}
        role="dialog"
        dir={dirProp ?? resolvedDir}
        data-slot={dataSlot}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        aria-label={nativeAriaLabel}
        aria-labelledby={resolvedAriaLabelledBy}
        aria-describedby={resolvedAriaDescribedBy}
        aria-modal={modal || undefined}
        tabIndex={-1}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
        onMouseEnter={
          triggerMode === "hover"
            ? composeEventHandlers(onMouseEnter, hoverOpen)
            : onMouseEnter
        }
        onMouseLeave={
          triggerMode === "hover"
            ? composeEventHandlers(onMouseLeave, hoverClose)
            : onMouseLeave
        }
      >
        <FocusScopeProvider scope={focusScope}>
          <div data-slot="popover-viewport">
            {viewportChildren}
          </div>
          {arrowChildren}
        </FocusScopeProvider>
      </div>
      {!modal ? (
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
