"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSwipeableItemContext } from "./context.js";
import {
  clampSwipeableItemOffset,
  getSwipeableItemSideFromKey,
  getSwipeableItemSizeForSide,
} from "./utils.js";

type SwipeableItemContentNativeProps = NativeDivProps<
  | "children"
  | "onKeyDown"
  | "onLostPointerCapture"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
>;

export interface SwipeableItemContentProps extends SwipeableItemContentNativeProps {
  /** Consumer keydown handler. Runs before built-in keyboard behavior. */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /** Consumer pointerdown handler. Runs before built-in pointer behavior. */
  onPointerDown?: PointerEventHandler<HTMLElement>;
  /** Consumer pointermove handler. Runs before built-in pointer behavior. */
  onPointerMove?: PointerEventHandler<HTMLElement>;
  /** Consumer pointerup handler. Runs before built-in pointer behavior. */
  onPointerUp?: PointerEventHandler<HTMLElement>;
  /** Consumer pointercancel handler. Runs before built-in pointer behavior. */
  onPointerCancel?: PointerEventHandler<HTMLElement>;
  /** Consumer lostpointercapture handler. Runs before built-in pointer behavior. */
  onLostPointerCapture?: PointerEventHandler<HTMLElement>;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Swipeable content children. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

interface PointerState {
  pointerId: number;
  startX: number;
  startY: number;
  baseOffset: number;
  currentOffset: number;
  contentWidth: number;
  dragging: boolean;
}

const horizontalIntentDistance = 8;

export const SwipeableItemContent = forwardRef<HTMLElement, SwipeableItemContentProps>(
  function SwipeableItemContent(
    {
      onKeyDown,
      onLostPointerCapture,
      onPointerCancel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      render,
      asChild,
      children,
      tabIndex,
      "data-slot": dataSlot = "swipeable-item-content",
      ...restProps
    },
    ref,
  ) {
    const {
      clampOffset,
      close,
      dir,
      disabled,
      dragging,
      endSize,
      fullSwipeThreshold,
      getOffsetForSide,
      getSideForOffset,
      offset,
      onFullSwipe,
      openSide,
      readOnly,
      setDragging,
      setOffset,
      setOpenSide,
      startSize,
      threshold,
    } = useSwipeableItemContext();
    const pointerStateRef = useRef<PointerState | null>(null);
    const state = openSide ? "open" : "closed";

    const clampDragOffset = useCallback((nextOffset: number, contentWidth: number) => {
      if (contentWidth <= 0) return clampOffset(nextOffset);

      const side = getSideForOffset(nextOffset);
      const actionSize = getSwipeableItemSizeForSide(side, startSize, endSize);
      if (!side || actionSize <= 0) return clampOffset(nextOffset);

      const fullStartSize = side === "start" ? Math.max(startSize, contentWidth) : startSize;
      const fullEndSize = side === "end" ? Math.max(endSize, contentWidth) : endSize;
      return clampSwipeableItemOffset(nextOffset, dir, fullStartSize, fullEndSize);
    }, [
      clampOffset,
      dir,
      endSize,
      getSideForOffset,
      onFullSwipe,
      startSize,
    ]);

    const settleOffset = useCallback((nextOffset: number, contentWidth: number) => {
      const side = getSideForOffset(nextOffset);
      const size = getSwipeableItemSizeForSide(side, startSize, endSize);
      const shouldFullSwipe =
        Boolean(onFullSwipe) &&
        side !== null &&
        size > 0 &&
        contentWidth > 0 &&
        Math.abs(nextOffset) >= contentWidth * fullSwipeThreshold;

      if (shouldFullSwipe && side) {
        setOpenSide(null);
        setOffset(0);
        setDragging(false);
        onFullSwipe?.(side);
        return;
      }

      const shouldOpen = side !== null && size > 0 && Math.abs(nextOffset) >= size * threshold;
      setOpenSide(shouldOpen ? side : null);
      setOffset(getOffsetForSide(shouldOpen ? side : null));
      setDragging(false);
    }, [
      endSize,
      getOffsetForSide,
      getSideForOffset,
      fullSwipeThreshold,
      onFullSwipe,
      setDragging,
      setOffset,
      setOpenSide,
      startSize,
      threshold,
    ]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>((event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;

      if (event.key === "Escape") {
        if (!openSide) return;
        event.preventDefault();
        close();
        return;
      }

      const side = getSwipeableItemSideFromKey(event.key, dir);
      if (!side) return;

      const size = getSwipeableItemSizeForSide(side, startSize, endSize);
      if (size <= 0) return;

      event.preventDefault();
      if (openSide) {
        if (openSide === side && onFullSwipe) {
          setOpenSide(null);
          setOffset(0);
          onFullSwipe(side);
          return;
        }

        close();
        return;
      }

      setOpenSide(side);
    }, [
      close,
      dir,
      disabled,
      endSize,
      onFullSwipe,
      onKeyDown,
      openSide,
      readOnly,
      setOffset,
      setOpenSide,
      startSize,
    ]);

    const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || readOnly || event.button !== 0) return;
      if (pointerStateRef.current !== null) return;

      pointerStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseOffset: offset,
        currentOffset: offset,
        contentWidth: event.currentTarget.getBoundingClientRect().width,
        dragging: false,
      };
    }, [disabled, offset, onPointerDown, readOnly]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerMove?.(event);
      if (event.defaultPrevented) return;

      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - pointerState.startX;
      const deltaY = event.clientY - pointerState.startY;

      if (!pointerState.dragging) {
        const horizontalDistance = Math.abs(deltaX);
        if (horizontalDistance < horizontalIntentDistance || horizontalDistance <= Math.abs(deltaY)) {
          return;
        }

        pointerState.dragging = true;
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      const nextOffset = clampDragOffset(
        pointerState.baseOffset + deltaX,
        pointerState.contentWidth,
      );
      pointerState.currentOffset = nextOffset;
      setOffset(nextOffset);
    }, [clampDragOffset, onPointerMove, setDragging, setOffset]);

    const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerUp?.(event);
      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      pointerStateRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!pointerState.dragging) return;
      settleOffset(pointerState.currentOffset, pointerState.contentWidth);
    }, [onPointerUp, settleOffset]);

    const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerCancel?.(event);
      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      pointerStateRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragging(false);
      setOffset(pointerState.baseOffset);
    }, [onPointerCancel, setDragging, setOffset]);

    const handleLostPointerCapture = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onLostPointerCapture?.(event);
      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      pointerStateRef.current = null;
      if (!pointerState.dragging) {
        setDragging(false);
        return;
      }
      settleOffset(pointerState.currentOffset, pointerState.contentWidth);
    }, [onLostPointerCapture, setDragging, settleOffset]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      tabIndex: tabIndex ?? 0,
      "data-slot": dataSlot,
      "data-state": state,
      ...(openSide && { "data-side": openSide }),
      ...(dragging && { "data-dragging": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      "aria-disabled": disabled || undefined,
      onKeyDown: handleKeyDown,
      onLostPointerCapture: handleLostPointerCapture,
      onPointerCancel: handlePointerCancel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
