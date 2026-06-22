"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
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
  useFocusOnMount,
  useFocusRestore,
  useFocusTrap,
} from "../../hooks/focus.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  PopoverContentContextProvider,
  usePopoverContext,
  type PopoverContentContextValue,
} from "./context.js";

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

export interface PopoverContentProps extends PopoverContentNativeProps {
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  className?: string;
  ariaLabel?: string;
  "data-slot"?: string;
}

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

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
function PopoverContent(
  {
    children,
    side = "bottom",
    align = "center",
    sideOffset = 8,
    className,
    ariaLabel,
    onMouseEnter,
    onMouseLeave,
    "data-slot": dataSlot = "popover-content",
    style,
    ...restProps
  },
  ref,
) {
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
  } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const focusScope = useCreateFocusScope();
  const beforeGuardRef = useRef<HTMLSpanElement>(null);
  const afterGuardRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);

  useFocusRestore(isOpen && modal);
  useFocusOnMount(contentRef, isPresent);
  useFocusScopeContainer(contentRef, isPresent);
  useFocusTrap(contentRef, isOpen && modal, { scope: focusScope });
  useFocusScopeContainer(contentRef, isOpen && modal, focusScope);
  useScrollLock(isOpen && modal);

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
    onClickAway: onClose,
    enabled: isOpen && closeOnInteractOutside,
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
          relatedTarget !== beforeGuard &&
          relatedTarget !== afterGuard)
      ) {
        onClose();
      }
    };

    const content = contentRef.current;
    content?.addEventListener("focusout", handleFocusOut);

    return () => {
      content?.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen, modal, onClose, triggerRef]);

  const referenceElement = anchorRef.current ?? triggerRef.current;
  const middleware = useMemo(
    () => [
      offset(sideOffset),
      flip(),
      shift({ padding: 8 }),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    [sideOffset],
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
    () => onOpen(),
    [onOpen],
  );
  const hoverClose: MouseEventHandler<HTMLDivElement> = useCallback(
    () => onClose(),
    [onClose],
  );
  const handleBeforeGuardFocus = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    onClose();
    focusWithoutScrolling(trigger);
  }, [onClose, triggerRef]);
  const handleAfterGuardFocus = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    const beforeGuard = beforeGuardRef.current;
    const afterGuard = afterGuardRef.current;

    if (!trigger || !content) return;

    onClose();
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
        data-slot={dataSlot}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        aria-label={ariaLabel}
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
          {children}
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
