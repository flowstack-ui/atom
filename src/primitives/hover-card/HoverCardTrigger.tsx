"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useId,
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
  value?: string;
  "data-slot"?: string;
}

export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
function HoverCardTrigger(
  {
    children,
    asChild = false,
    className,
    render,
    value: valueProp,
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
    registerTrigger, activateTrigger, triggerValue, ids,
    getReferenceProps,
    markTouchInteraction,
    hasRecentTouchInteraction,
    disabled,
    hoverInputAvailable,
  } = useHoverCardContext();
  const generatedValue = useId();
  const value = valueProp ?? generatedValue;
  const register = useCallback((node: HTMLElement | null) => registerTrigger(value, node), [registerTrigger, value]);
  const composedRef = useMemo(
    () => composeRefs(register, ref),
    [ref, register],
  );

  const handleFocus: FocusEventHandler<HTMLSpanElement> = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!hasRecentTouchInteraction() && event.target.matches(":focus-visible")) {
        if (!disabled) { activateTrigger(value, event.currentTarget); onOpen(); }
      }
    },
    [disabled, hasRecentTouchInteraction, onOpen, activateTrigger, value],
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
    "data-value": valueProp,
    "data-current": triggerValue === value ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    id: restProps.id ?? (typeof ids?.trigger === "function" ? ids.trigger(valueProp) : ids?.trigger),
    onMouseEnter: composeEventHandlers(interactionProps.onMouseEnter as React.MouseEventHandler<HTMLElement> | undefined, (event: React.MouseEvent<HTMLElement>) => {
      if (hoverInputAvailable && !hasRecentTouchInteraction()) { activateTrigger(value, event.currentTarget); if (!isOpen) onOpen(); }
    }),
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
