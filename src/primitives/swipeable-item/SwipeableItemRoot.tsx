"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  SwipeableItemContextProvider,
  type SwipeableItemContextValue,
  type SwipeableItemOpenSide,
  type SwipeableItemSide,
} from "./context.js";
import {
  clampSwipeableItemOffset,
  getSwipeableItemOffsetForSide,
  getSwipeableItemSideForOffset,
} from "./utils.js";

type SwipeableItemRootNativeProps = NativeDivProps<"children">;

export interface SwipeableItemRootProps extends SwipeableItemRootNativeProps {
  /** Controlled open action side. */
  openSide?: SwipeableItemOpenSide;
  /** Initial open action side for uncontrolled usage. @default null */
  defaultOpenSide?: SwipeableItemOpenSide;
  /** Called when the requested open side changes. */
  onOpenSideChange?: (side: SwipeableItemOpenSide) => void;
  /** Called when a drag passes the full-swipe threshold on a side with actions. */
  onFullSwipe?: (side: SwipeableItemSide) => void;
  /** Disable swipe and keyboard interaction. */
  disabled?: boolean;
  /** Prevent swipe and keyboard changes while preserving semantics. */
  readOnly?: boolean;
  /** Fraction of an action width required to settle open. @default 0.35 */
  threshold?: number;
  /** Fraction of the content width required to trigger a full-swipe action. @default 0.6 */
  fullSwipeThreshold?: number;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Swipeable item children. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
  /** Direction override for swipe logic and DOM direction. Defaults to DirectionProvider. */
  dir?: DirectionValue;
}

function normalizeThreshold(threshold: number, fallback: number): number {
  if (!Number.isFinite(threshold)) return fallback;
  return Math.max(0, Math.min(1, threshold));
}

export const SwipeableItemRoot = forwardRef<HTMLDivElement, SwipeableItemRootProps>(
  function SwipeableItemRoot(
    {
      openSide: controlledOpenSide,
      defaultOpenSide = null,
      onOpenSideChange,
      onFullSwipe,
      disabled = false,
      readOnly = false,
      threshold = 0.35,
      fullSwipeThreshold = 0.6,
      render,
      asChild,
      children,
      style,
      dir: dirProp,
      "data-slot": dataSlot = "swipeable-item",
      ...restProps
    },
    ref,
  ) {
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const [openSide, setOpenSide] = useControllableState<SwipeableItemOpenSide>({
      value: controlledOpenSide,
      defaultValue: defaultOpenSide,
      onChange: onOpenSideChange,
    });
    const [offset, setOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [startSize, setStartSize] = useState(0);
    const [endSize, setEndSize] = useState(0);
    const startActionsRef = useRef<HTMLElement | null>(null);
    const endActionsRef = useRef<HTMLElement | null>(null);
    const normalizedThreshold = normalizeThreshold(threshold, 0.35);
    const normalizedFullSwipeThreshold = normalizeThreshold(fullSwipeThreshold, 0.6);

    const getOffsetForSide = useCallback(
      (side: SwipeableItemOpenSide) =>
        getSwipeableItemOffsetForSide(side, dir, startSize, endSize),
      [dir, endSize, startSize],
    );

    const getSideForOffset = useCallback(
      (nextOffset: number) => getSwipeableItemSideForOffset(nextOffset, dir),
      [dir],
    );

    const clampOffset = useCallback(
      (nextOffset: number) =>
        clampSwipeableItemOffset(nextOffset, dir, startSize, endSize),
      [dir, endSize, startSize],
    );

    const setActionSize = useCallback((side: SwipeableItemSide, size: number) => {
      const safeSize = Math.max(0, size);
      if (side === "start") {
        setStartSize(safeSize);
      } else {
        setEndSize(safeSize);
      }
    }, []);

    const close = useCallback(() => {
      setOpenSide(null);
    }, [setOpenSide]);

    useEffect(() => {
      if (disabled || readOnly) {
        if (openSide !== null) setOpenSide(null);
        if (dragging) setDragging(false);
      }
    }, [disabled, dragging, openSide, readOnly, setOpenSide]);

    useEffect(() => {
      if (dragging) return;
      setOffset(getOffsetForSide(openSide));
    }, [dragging, getOffsetForSide, openSide]);

    const contextValue = useMemo<SwipeableItemContextValue>(
      () => ({
        openSide,
        setOpenSide: setOpenSide as (side: SetStateAction<SwipeableItemOpenSide>) => void,
        onFullSwipe,
        offset,
        setOffset,
        dragging,
        setDragging,
        disabled,
        readOnly,
        threshold: normalizedThreshold,
        fullSwipeThreshold: normalizedFullSwipeThreshold,
        dir,
        startActionsRef,
        endActionsRef,
        startSize,
        endSize,
        setActionSize,
        getOffsetForSide,
        getSideForOffset,
        clampOffset,
        close,
      }),
      [
        clampOffset,
        close,
        dir,
        disabled,
        dragging,
        endSize,
        getOffsetForSide,
        getSideForOffset,
        normalizedThreshold,
        normalizedFullSwipeThreshold,
        offset,
        onFullSwipe,
        openSide,
        readOnly,
        setActionSize,
        setOpenSide,
        startSize,
      ],
    );

    const state = openSide ? "open" : "closed";
    const rootStyle = {
      ...style,
      "--atom-swipeable-item-offset": `${offset}px`,
      "--atom-swipeable-item-start-size": `${startSize}px`,
      "--atom-swipeable-item-end-size": `${endSize}px`,
    } as CSSProperties;

    const behaviorProps: Record<string, unknown> = {
      dir,
      ...restProps,
      ref,
      style: rootStyle,
      "data-slot": dataSlot,
      "data-state": state,
      ...(openSide && { "data-side": openSide }),
      ...(dragging && { "data-dragging": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <SwipeableItemContextProvider value={contextValue}>
        {element}
      </SwipeableItemContextProvider>
    );
  },
);
