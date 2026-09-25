"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSwipeableItemContext } from "./context.js";
import { useSwipeableItemMotion } from "./useSwipeableItemMotion.js";
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
  element: HTMLElement;
  sampleX: number;
  sampleTime: number;
  velocity: number;
  lastMoveTime: number;
}

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
      style,
      tabIndex,
      onClickCapture,
      "data-slot": dataSlot = "swipeable-item-content",
      ...restProps
    },
    ref,
  ) {
    const context = useSwipeableItemContext();
    useSwipeableItemMotion(context);
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
      thresholds, activationDistance, velocityThreshold, resistance, fullSwipeSides,
      contentRef, getOffset, setArmedSide, resetKey, closeOnContentClick,
    } = context;
    const composedRef = useMemo(() => composeRefs(contentRef, ref), [contentRef, ref]);
    const pointerStateRef = useRef<PointerState | null>(null);
    const suppressClickRef = useRef(false);
    useEffect(() => () => {
      const session = pointerStateRef.current;
      pointerStateRef.current = null;
      if (session?.element.hasPointerCapture?.(session.pointerId)) {
        session.element.releasePointerCapture(session.pointerId);
      }
      setDragging(false);
      setArmedSide(null);
    }, [disabled, readOnly, dir, resetKey, openSide, startSize, endSize, setDragging, setArmedSide]);
    const state = openSide ? "open" : "closed";

    const clampDragOffset = useCallback((nextOffset: number, contentWidth: number) => {
      const side = getSideForOffset(nextOffset);
      const actionSize = getSwipeableItemSizeForSide(side, startSize, endSize);
      if (!side || actionSize <= 0) return clampOffset(nextOffset);
      if (!onFullSwipe || contentWidth <= 0 || (fullSwipeSides && !fullSwipeSides.includes(side))) {
        const clamped = clampOffset(nextOffset);
        const excess = nextOffset - clamped;
        return clamped + Math.sign(excess) * Math.min(Math.abs(excess) * resistance, actionSize * 0.25);
      }

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
      fullSwipeSides, resistance,
    ]);

    const settleOffset = useCallback((nextOffset: number, contentWidth: number, allowFullSwipe = true, velocity = 0, travel = 0) => {
      const side = getSideForOffset(nextOffset);
      const size = getSwipeableItemSizeForSide(side, startSize, endSize);
      const shouldFullSwipe =
        allowFullSwipe && Boolean(onFullSwipe) &&
        side !== null &&
        (!fullSwipeSides || fullSwipeSides.includes(side)) &&
        size > 0 &&
        contentWidth > 0 &&
        travel >= 32 &&
        Math.abs(nextOffset) >= contentWidth * fullSwipeThreshold;

      if (shouldFullSwipe && side) {
        setArmedSide(null);
        setOpenSide(null);
        setOffset(0);
        setDragging(false);
        onFullSwipe?.(side);
        return;
      }

      const candidateThreshold = side ? thresholds?.[side] : undefined;
      const sideThreshold = candidateThreshold !== undefined && Number.isFinite(candidateThreshold)
        ? Math.max(0, Math.min(1, candidateThreshold)) : threshold;
      const projectedOffset = nextOffset + (Math.abs(velocity) >= velocityThreshold ? Math.max(-size, Math.min(size, velocity * 120)) : 0);
      const shouldOpen = side !== null && size > 0 && getSideForOffset(projectedOffset) === side && Math.abs(projectedOffset) >= size * sideThreshold;
      setOpenSide(shouldOpen ? side : null);
      setDragging(false);
      setArmedSide(null);
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
      thresholds, fullSwipeSides, velocityThreshold, setArmedSide,
    ]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>((event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      if (event.target !== event.currentTarget) return;

      if (event.key === "Escape") {
        if (!openSide) return;
        event.preventDefault();
        close();
        return;
      }

      const side = getSwipeableItemSideFromKey(event.key, dir);
      if (!side) return;
      if (event.target !== event.currentTarget) return;

      const size = getSwipeableItemSizeForSide(side, startSize, endSize);
      if (size <= 0) return;

      event.preventDefault();
      if (openSide) {
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
      suppressClickRef.current = false;
      const target = event.target as HTMLElement;
      if (target.closest?.('input, textarea, select, [contenteditable="true"], [data-swipeable-ignore]')) return;

      pointerStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseOffset: getOffset(),
        currentOffset: getOffset(),
        contentWidth: event.currentTarget.getBoundingClientRect().width,
        dragging: false,
        element: event.currentTarget,
        sampleX: event.clientX,
        sampleTime: event.timeStamp,
        lastMoveTime: event.timeStamp,
        velocity: 0,
      };
    }, [disabled, getOffset, onPointerDown, readOnly]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerMove?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;

      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - pointerState.startX;
      const deltaY = event.clientY - pointerState.startY;

      if (!pointerState.dragging) {
        const horizontalDistance = Math.abs(deltaX);
        if (Math.abs(deltaY) >= activationDistance && Math.abs(deltaY) >= horizontalDistance) {
          pointerStateRef.current = null;
          return;
        }
        if (horizontalDistance < activationDistance || horizontalDistance <= Math.abs(deltaY)) {
          return;
        }

        pointerState.dragging = true;
        pointerState.baseOffset = getOffset();
        suppressClickRef.current = true;
        setDragging(true);
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic or already-canceled pointer. */ }
      }

      event.preventDefault();
      const nextOffset = clampDragOffset(
        pointerState.baseOffset + deltaX,
        pointerState.contentWidth,
      );
      pointerState.currentOffset = nextOffset;
      const elapsed = event.timeStamp - pointerState.sampleTime;
      if (elapsed > 0) {
        pointerState.velocity = elapsed <= 80 ? (event.clientX - pointerState.sampleX) / elapsed : 0;
        pointerState.sampleX = event.clientX;
        pointerState.sampleTime = event.timeStamp;
      }
      pointerState.lastMoveTime = event.timeStamp;
      const side = getSideForOffset(nextOffset);
      setArmedSide(side && onFullSwipe && (!fullSwipeSides || fullSwipeSides.includes(side)) && Math.abs(deltaX) >= 32 && Math.abs(nextOffset) >= pointerState.contentWidth * fullSwipeThreshold ? side : null);
      setOffset(nextOffset);
    }, [clampDragOffset, disabled, readOnly, onPointerMove, setDragging, setOffset, activationDistance, getOffset, getSideForOffset, setArmedSide, onFullSwipe, fullSwipeSides, fullSwipeThreshold]);

    const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onPointerUp?.(event);
      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      pointerStateRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!pointerState.dragging) return;
      if (disabled || readOnly || event.defaultPrevented) {
        setDragging(false);
        setOffset(getOffsetForSide(openSide));
        return;
      }
      const releaseOffset = clampDragOffset(pointerState.baseOffset + event.clientX - pointerState.startX, pointerState.contentWidth);
      settleOffset(releaseOffset, pointerState.contentWidth, true,
        event.timeStamp - pointerState.lastMoveTime > 80 ? 0 : pointerState.velocity,
        Math.abs(event.clientX - pointerState.startX));
      setArmedSide(null);
    }, [disabled, readOnly, getOffsetForSide, openSide, onPointerUp, setDragging, setOffset, settleOffset, setArmedSide, clampDragOffset]);

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
      setArmedSide(null);
    }, [onPointerCancel, setDragging, setOffset, setArmedSide]);

    const handleLostPointerCapture = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      onLostPointerCapture?.(event);
      const pointerState = pointerStateRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;

      pointerStateRef.current = null;
      if (!pointerState.dragging) {
        setDragging(false);
        return;
      }
      if (disabled || readOnly) {
        setDragging(false);
        return;
      }
      settleOffset(pointerState.currentOffset, pointerState.contentWidth, false);
    }, [disabled, readOnly, onLostPointerCapture, setDragging, settleOffset]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      style: { touchAction: "pan-y", ...style },
      tabIndex: disabled ? -1 : tabIndex ?? 0,
      "data-slot": dataSlot,
      "data-state": state,
      ...(openSide && { "data-side": openSide }),
      ...(dragging && { "data-dragging": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      "aria-disabled": disabled || undefined,
      onKeyDown: handleKeyDown,
      onClickCapture: (event: import("react").MouseEvent<HTMLElement>) => {
        onClickCapture?.(event as import("react").MouseEvent<HTMLDivElement>);
        if (event.defaultPrevented) return;
        const suppressDrag = suppressClickRef.current && event.detail !== 0;
        const dismiss = closeOnContentClick && openSide && !disabled && !readOnly;
        if (!suppressDrag && !dismiss) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        if (dismiss && !suppressDrag) close();
      },
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
