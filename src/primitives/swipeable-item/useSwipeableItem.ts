"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type { SwipeableItemContextValue, SwipeableItemOpenSide, SwipeableItemSide } from "./context.js";
import { clampSwipeableItemOffset, getSwipeableItemOffsetForSide, getSwipeableItemSideForOffset, getSwipeableItemSizeForSide } from "./utils.js";

export interface UseSwipeableItemProps {
  openSide?: SwipeableItemOpenSide;
  defaultOpenSide?: SwipeableItemOpenSide;
  onOpenSideChange?: (side: SwipeableItemOpenSide) => void;
  onFullSwipe?: (side: SwipeableItemSide) => void;
  /** Explicit logical sides. Omitted retains Atom's legacy callback-only opt-in. */
  fullSwipeSides?: readonly SwipeableItemSide[];
  disabled?: boolean;
  readOnly?: boolean;
  threshold?: number;
  thresholds?: Partial<Record<SwipeableItemSide, number>>;
  fullSwipeThreshold?: number;
  activationDistance?: number;
  /** Recent pointer velocity in px/ms required to influence reveal. */
  velocityThreshold?: number;
  /** Bounded resistance beyond the action extent, 0 disables. */
  resistance?: number;
  closeOnOutsideClick?: boolean;
  closeOnContentClick?: boolean;
  motion?: "default" | "none";
  onSettle?: (details: { openSide: SwipeableItemOpenSide; offset: number }) => void;
  dir?: DirectionValue;
}

const finite = (value: number | undefined, fallback: number, min: number, max: number) =>
  value !== undefined && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

/** One controller for standalone Root and externally coordinated RootProvider. */
export function useSwipeableItem(options: UseSwipeableItemProps = {}): SwipeableItemContextValue {
  const inheritedDir = useDirection();
  const dir = options.dir ?? inheritedDir;
  const disabled = options.disabled ?? false;
  const readOnly = options.readOnly ?? false;
  const [openSide, setOpenSide] = useControllableState<SwipeableItemOpenSide>({
    value: options.openSide, defaultValue: options.defaultOpenSide ?? null, onChange: options.onOpenSideChange,
  });
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  const [armedSide, setArmedSide] = useState<SwipeableItemOpenSide>(null);
  const [resetKey, setResetKey] = useState(0);
  const [startSize, setStartSize] = useState(0);
  const [endSize, setEndSize] = useState(0);
  const previousSizes = useRef({ start: 0, end: 0 });
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const startActionsRef = useRef<HTMLElement | null>(null);
  const endActionsRef = useRef<HTMLElement | null>(null);
  const getOffsetForSide = useCallback((side: SwipeableItemOpenSide) => getSwipeableItemOffsetForSide(side, dir, startSize, endSize), [dir, startSize, endSize]);
  const getSideForOffset = useCallback((value: number) => getSwipeableItemSideForOffset(value, dir), [dir]);
  const clampOffset = useCallback((value: number) => clampSwipeableItemOffset(value, dir, startSize, endSize), [dir, startSize, endSize]);
  const setActionSize = useCallback((side: SwipeableItemSide, size: number) => {
    (side === "start" ? setStartSize : setEndSize)(Number.isFinite(size) ? Math.max(0, size) : 0);
  }, []);
  const close = useCallback(() => setOpenSide(null), [setOpenSide]);
  const open = useCallback((side: SwipeableItemSide) => {
    if (!disabled && !readOnly && getOffsetForSide(side) !== 0) setOpenSide(side);
  }, [disabled, readOnly, getOffsetForSide, setOpenSide]);
  const reset = useCallback(() => {
    setResetKey((key) => key + 1);
    setDragging(false);
    setArmedSide(null);
    setOpenSide(null);
  }, [setOpenSide]);
  const getOffset = useCallback(() => {
    const element = contentRef.current;
    const win = element?.ownerDocument.defaultView;
    if (!element || !win) return offset;
    const transform = win.getComputedStyle(element).transform;
    if (transform === "none") return 0;
    try { return new win.DOMMatrixReadOnly(transform).m41; } catch { return offset; }
  }, [offset]);
  const getProgress = useCallback(() => {
    const value = getOffset();
    const size = getSwipeableItemSizeForSide(getSideForOffset(value), startSize, endSize);
    return size > 0 ? Math.min(1, Math.abs(value) / size) : 0;
  }, [getOffset, getSideForOffset, startSize, endSize]);
  useEffect(() => {
    if (disabled || readOnly) {
      if (openSide !== null) setOpenSide(null);
      setDragging(false);
      setArmedSide(null);
    }
  }, [disabled, readOnly, openSide, setOpenSide]);
  useEffect(() => {
    if (!dragging) setOffset(disabled || readOnly ? 0 : getOffsetForSide(openSide));
  }, [dragging, disabled, readOnly, getOffsetForSide, openSide, resetKey]);
  useEffect(() => {
    const sizes = { start: startSize, end: endSize };
    if (openSide && previousSizes.current[openSide] > 0 && sizes[openSide] === 0) close();
    previousSizes.current = sizes;
  }, [openSide, startSize, endSize, close]);
  useEffect(() => {
    const root = rootRef.current;
    if (!options.closeOnOutsideClick || !openSide || !root) return;
    const doc = root.ownerDocument;
    const handle = (event: PointerEvent) => {
      // Portalled action popups retain focus outside the row and own dismissal.
      const active = doc.activeElement;
      if (active && !root.contains(active) && active.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]')) return;
      if (!event.composedPath().includes(root)) close();
    };
    doc.addEventListener("pointerdown", handle);
    return () => doc.removeEventListener("pointerdown", handle);
  }, [options.closeOnOutsideClick, openSide, close]);
  return {
    openSide, setOpenSide, offset, setOffset, dragging, setDragging, settling, setSettling,
    armedSide, setArmedSide, resetKey, rootRef, contentRef, disabled, readOnly, dir,
    startActionsRef, endActionsRef, startSize, endSize, setActionSize,
    getOffsetForSide, getSideForOffset, clampOffset, close, open, reset, getOffset, getProgress,
    threshold: finite(options.threshold, 0.35, 0, 1),
    thresholds: options.thresholds,
    fullSwipeThreshold: finite(options.fullSwipeThreshold, 0.6, 0, 1),
    activationDistance: finite(options.activationDistance, 8, 1, 64),
    velocityThreshold: finite(options.velocityThreshold, 0.5, 0.1, 5),
    resistance: finite(options.resistance, 0, 0, 1),
    onFullSwipe: options.onFullSwipe, fullSwipeSides: options.fullSwipeSides,
    closeOnContentClick: options.closeOnContentClick ?? false,
    motion: options.motion ?? "default", onSettle: options.onSettle,
  };
}

export type SwipeableItemController = ReturnType<typeof useSwipeableItem>;
