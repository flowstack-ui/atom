"use client";

import {
  createContext,
  useContext,
  type RefObject,
  type SetStateAction,
} from "react";
import type { DirectionValue } from "../direction/index.js";

export type SwipeableItemSide = "start" | "end";
export type SwipeableItemOpenSide = SwipeableItemSide | null;

export interface SwipeableItemContextValue {
  openSide: SwipeableItemOpenSide;
  setOpenSide: (side: SetStateAction<SwipeableItemOpenSide>) => void;
  onFullSwipe: ((side: SwipeableItemSide) => void) | undefined;
  offset: number;
  setOffset: (offset: number) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  disabled: boolean;
  readOnly: boolean;
  threshold: number;
  fullSwipeThreshold: number;
  dir: DirectionValue;
  startActionsRef: RefObject<HTMLElement | null>;
  endActionsRef: RefObject<HTMLElement | null>;
  startSize: number;
  endSize: number;
  setActionSize: (side: SwipeableItemSide, size: number) => void;
  getOffsetForSide: (side: SwipeableItemOpenSide) => number;
  getSideForOffset: (offset: number) => SwipeableItemOpenSide;
  clampOffset: (offset: number) => number;
  close: () => void;
}

const SwipeableItemContext = createContext<SwipeableItemContextValue | null>(null);
SwipeableItemContext.displayName = "SwipeableItemContext";

export const SwipeableItemContextProvider = SwipeableItemContext.Provider;

export function useSwipeableItemContext(): SwipeableItemContextValue {
  const ctx = useContext(SwipeableItemContext);
  if (!ctx) {
    throw new Error("SwipeableItem compound components must be used within <SwipeableItemRoot>");
  }
  return ctx;
}
