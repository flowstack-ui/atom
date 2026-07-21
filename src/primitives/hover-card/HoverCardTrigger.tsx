"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type FocusEvent,
  type FocusEventHandler,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useHoverCardContext } from "./context.js";

type HoverCardTriggerNativeProps = NativeSpanProps<"children">;

export interface HoverCardTriggerProps extends HoverCardTriggerNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
function HoverCardTrigger(
  {
    children,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "hover-card-trigger",
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onPointerDown,
    onPointerOverCapture,
    onTouchStart,
    onTouchStartCapture,
    tabIndex,
    ...restProps
  },
  ref,
) {
  const {
    isOpen,
    onOpen,
    onClose,
    triggerRef,
    setTriggerElement,
    getReferenceProps,
    markTouchInteraction,
    hasRecentTouchInteraction,
    disabled,
  } = useHoverCardContext();
  const composedRef = useMemo(
    () => composeRefs(triggerRef, setTriggerElement, ref),
    [ref, setTriggerElement, triggerRef],
  );

  const handleFocus: FocusEventHandler<HTMLSpanElement> = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!hasRecentTouchInteraction() && event.target.matches(":focus-visible")) {
        if (!disabled) onOpen();
      }
    },
    [disabled, hasRecentTouchInteraction, onOpen],
  );

  const handleTouchStart = useCallback(() => {
    markTouchInteraction();
  }, [markTouchInteraction]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (event.pointerType === "touch") markTouchInteraction();
    },
    [markTouchInteraction],
  );

  const handlePointerOverCapture = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (event.pointerType === "touch") markTouchInteraction();
    },
    [markTouchInteraction],
  );

  const handleBlur: FocusEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const interactionProps = getReferenceProps({
    onMouseEnter,
    onMouseLeave,
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    onPointerDown: (event) => {
      handlePointerDown(event);
      onPointerDown?.(event as ReactPointerEvent<HTMLSpanElement>);
    },
    onPointerOverCapture: (event) => {
      handlePointerOverCapture(event);
      onPointerOverCapture?.(event as ReactPointerEvent<HTMLSpanElement>);
    },
    onTouchStart: (event) => {
      handleTouchStart();
      onTouchStart?.(event as ReactTouchEvent<HTMLSpanElement>);
    },
    onTouchStartCapture: (event) => {
      handleTouchStart();
      onTouchStartCapture?.(event as ReactTouchEvent<HTMLSpanElement>);
    },
  });
  const triggerProps = {
    ...restProps,
    ...interactionProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    tabIndex: asChild ? tabIndex : (tabIndex ?? (disabled ? -1 : 0)),
    className,
  };

  if (asChild) {
    return cloneAndMerge(children, triggerProps);
  }

  return renderElement(render, "span", {
    ...triggerProps,
    children,
  });
});
