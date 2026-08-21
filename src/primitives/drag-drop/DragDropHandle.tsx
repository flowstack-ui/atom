"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDragDropContext } from "./context.js";
import { useDragDropItemContext } from "./item-context.js";

type NativeProps = NativeButtonProps<
  "children" | "disabled" | "onKeyDown" | "onPointerCancel" | "onPointerDown" | "onPointerMove" | "onPointerUp"
>;

export interface DragDropHandleProps extends NativeProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onPointerMove?: PointerEventHandler<HTMLElement>;
  onPointerUp?: PointerEventHandler<HTMLElement>;
  onPointerCancel?: PointerEventHandler<HTMLElement>;
}

interface PointerSession {
  active: boolean;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export const DragDropHandle = forwardRef<HTMLElement, DragDropHandleProps>(
  function DragDropHandle({
    render,
    asChild,
    children,
    style,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    "data-slot": dataSlot = "drag-drop-handle",
    ...restProps
  }, ref) {
    const {
      begin,
      cancel,
      commit,
      dir,
      disabled,
      instructionsId,
      moveKeyboard,
      orientation,
      readOnly,
      state,
      updatePointer,
    } = useDragDropContext();
    const item = useDragDropItemContext();
    const pointerRef = useRef<PointerSession | null>(null);
    const active = state.activeValue === item.value;
    const unavailable = disabled || readOnly || item.disabled;

    const clearPointer = useCallback(() => {
      const session = pointerRef.current;
      if (session?.timer) clearTimeout(session.timer);
      pointerRef.current = null;
    }, []);

    useEffect(() => clearPointer, [clearPointer]);

    const startPointer = useCallback((session: PointerSession, element: HTMLElement) => {
      if (session.active) return;
      session.active = begin(item.value, "pointer", { x: session.startX, y: session.startY });
      if (session.active && !element.hasPointerCapture(session.pointerId)) {
        element.setPointerCapture(session.pointerId);
      }
    }, [begin, item.value]);

    const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || unavailable || event.button !== 0 || pointerRef.current) return;
      const session: PointerSession = {
        active: false,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        startX: event.clientX,
        startY: event.clientY,
        timer: null,
      };
      pointerRef.current = session;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (event.pointerType === "touch") {
        const element = event.currentTarget;
        session.timer = setTimeout(() => startPointer(session, element), 220);
      }
    }, [onPointerDown, startPointer, unavailable]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerMove?.(event);
      if (event.defaultPrevented) return;
      const session = pointerRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
      if (!session.active) {
        if (session.pointerType === "touch") {
          if (distance > 8) {
            clearPointer();
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }
          return;
        }
        if (distance < 6) return;
        startPointer(session, event.currentTarget);
      }
      if (!session.active) return;
      event.preventDefault();
      updatePointer({ x: event.clientX, y: event.clientY });
    }, [clearPointer, onPointerMove, startPointer, updatePointer]);

    const finishPointer = useCallback((event: Parameters<PointerEventHandler<HTMLElement>>[0], cancelled: boolean) => {
      const session = pointerRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      const wasActive = session.active;
      clearPointer();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!wasActive) return;
      if (cancelled) cancel();
      else commit();
    }, [cancel, clearPointer, commit]);

    const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerUp?.(event);
      if (!event.defaultPrevented) finishPointer(event, false);
    }, [finishPointer, onPointerUp]);

    const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerCancel?.(event);
      finishPointer(event, true);
    }, [finishPointer, onPointerCancel]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>((event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || unavailable) return;
      if (!active && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        begin(item.value, "keyboard");
        return;
      }
      if (!active) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        moveKeyboard(event.key === "Home" ? "first" : "last");
        return;
      }
      const startKey = orientation === "vertical"
        ? "ArrowUp"
        : dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      const endKey = orientation === "vertical"
        ? "ArrowDown"
        : dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      if (event.key === startKey || event.key === endKey) {
        event.preventDefault();
        moveKeyboard(event.key === startKey ? "start" : "end");
      }
    }, [active, begin, cancel, commit, dir, item.value, moveKeyboard, onKeyDown, orientation, unavailable]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: unavailable || undefined,
      style: { touchAction: "none", ...style },
      "aria-describedby": instructionsId,
      "data-slot": dataSlot,
      "data-value": item.value,
      ...(active && { "data-dragging": "" }),
      onKeyDown: handleKeyDown,
      onPointerCancel: handlePointerCancel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
