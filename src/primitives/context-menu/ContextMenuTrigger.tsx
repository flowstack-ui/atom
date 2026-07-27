"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";
import { useContextMenuContext } from "./context.js";

type ContextMenuTriggerNativeProps = NativeSpanProps<"children">;
const LONG_PRESS_DELAY = 700;
const LONG_PRESS_TOLERANCE = 10;

export interface ContextMenuTriggerProps extends ContextMenuTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const ContextMenuTrigger = forwardRef<
  HTMLElement,
  ContextMenuTriggerProps
>(function ContextMenuTrigger(
  {
    children,
    disabled = false,
    asChild = false,
    render,
    "data-slot": dataSlot = "context-menu-trigger",
    onContextMenu,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    style,
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const { setAnchorPoint } = useContextMenuContext();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [pressed, setPressed] = useState(false);
  const pressRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    timer: ReturnType<typeof setTimeout>;
    previousUserSelect: string;
    previousCallout: string;
  } | null>(null);
  const syntheticOpenAtRef = useRef(0);
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ctx.triggerRef, ref),
    [ctx.triggerRef, ref],
  );

  const clearLongPress = useCallback(() => {
    const session = pressRef.current;
    if (!session) return;
    clearTimeout(session.timer);
    const element = triggerRef.current;
    if (element) {
      element.style.userSelect = session.previousUserSelect;
      element.style.setProperty("-webkit-touch-callout", session.previousCallout);
    }
    pressRef.current = null;
    setPressed(false);
  }, []);

  useEffect(() => {
    const cancel = () => clearLongPress();
    globalThis.addEventListener?.("scroll", cancel, true);
    return () => {
      globalThis.removeEventListener?.("scroll", cancel, true);
      clearLongPress();
    };
  }, [clearLongPress]);

  useEffect(() => {
    if (disabled) clearLongPress();
  }, [clearLongPress, disabled]);

  const handleContextMenu: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled) return;
      event.preventDefault();
      clearLongPress();
      if (Date.now() - syntheticOpenAtRef.current < 1000) return;
      setAnchorPoint({ x: event.clientX, y: event.clientY });
      ctx.onInitialHighlight("first");
      ctx.onHighlight(null);
      ctx.onOpen();
    },
    [clearLongPress, ctx, disabled, setAnchorPoint],
  );

  const handlePointerDown: PointerEventHandler<HTMLElement> = useCallback((event) => {
    if (pressRef.current) {
      clearLongPress();
      return;
    }
    if (disabled || !event.isPrimary || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    const element = triggerRef.current;
    if (!element) return;
    const x = event.clientX;
    const y = event.clientY;
    const previousUserSelect = element.style.userSelect;
    const previousCallout = element.style.getPropertyValue("-webkit-touch-callout");
    element.style.userSelect = "none";
    element.style.setProperty("-webkit-touch-callout", "none");
    const pointerId = event.pointerId;
    const timer = setTimeout(() => {
      const session = pressRef.current;
      if (!session || session.pointerId !== pointerId) return;
      syntheticOpenAtRef.current = Date.now();
      setAnchorPoint({ x, y });
      ctx.onInitialHighlight("first");
      ctx.onHighlight(null);
      ctx.onOpen();
      clearLongPress();
    }, LONG_PRESS_DELAY);
    pressRef.current = { pointerId, x, y, timer, previousUserSelect, previousCallout };
    setPressed(true);
  }, [clearLongPress, ctx, disabled, setAnchorPoint]);

  const handlePointerMove: PointerEventHandler<HTMLElement> = useCallback((event) => {
    const session = pressRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - session.x, event.clientY - session.y) > LONG_PRESS_TOLERANCE) {
      clearLongPress();
    }
  }, [clearLongPress]);

  const handlePointerEnd: PointerEventHandler<HTMLElement> = useCallback((event) => {
    const session = pressRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    clearLongPress();
  }, [clearLongPress]);

  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled) return;

      if ((event.key === "F10" && event.shiftKey) || event.key === "ContextMenu") {
        event.preventDefault();
        const referenceElement = triggerRef.current?.firstElementChild ?? triggerRef.current;
        const rect = referenceElement?.getBoundingClientRect();
        if (rect) {
          setAnchorPoint({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        }
        ctx.onInitialHighlight("first");
        ctx.onHighlight(null);
        ctx.onOpen();
      }
    },
    [ctx, disabled, setAnchorPoint],
  );

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    id: ctx.triggerId,
    "data-slot": dataSlot,
    "data-state": ctx.isOpen ? "open" : "closed",
    "data-disabled": disabled ? "" : undefined,
    "data-pressed": pressed ? "" : undefined,
    onContextMenu: composeEventHandlers(onContextMenu, handleContextMenu),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
    onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
    onPointerUp: composeEventHandlers(onPointerUp, handlePointerEnd),
    onPointerCancel: composeEventHandlers(onPointerCancel, handlePointerEnd),
    style: asChild || render ? style : { ...style, display: "contents" },
  };

  if (asChild) {
    return cloneAndMerge(children, triggerProps);
  }

  return renderElement(render, "span", { ...triggerProps, children });
});
