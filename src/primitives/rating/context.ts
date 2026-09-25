"use client";

import { createContext, useContext, type RefObject, type MutableRefObject, type ReactNode } from "react";
import type { DirectionValue } from "../direction/index.js";
import type { RatingItemState } from "./utils.js";

export interface RatingContextValue {
  hoveredValue: number | null;
  previewValue: number;
  setHoveredValue: (value: number | null) => void;
  clearValue: () => void;
  items: number[];
  rootRef: RefObject<HTMLDivElement | null>;
  rootId: string;
  labelId: string;
  controlId: string;
  setRegisteredLabel: (id: string | undefined) => void;
  inputMode: "auto" | "manual";
  hiddenInputOwner: MutableRefObject<symbol | null>;
  input: { name?: string; form?: string; formValue?: string; id?: string };
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  dir: DirectionValue;
  setValue: (value: number) => void;
  getItemState: (itemValue: number) => RatingItemState;
  beginPointerInteraction: (pointerId: number, pointerValue: number) => boolean;
  movePointerInteraction: (pointerId: number, pointerValue: number) => void;
  endPointerInteraction: (pointerId: number, itemValue: number) => void;
  finishPointerInteraction: (pointerId: number) => void;
  cancelPointerInteraction: (pointerId: number) => void;
}

export interface RatingItemContextValue extends RatingItemState { value: number }
const ItemContext = createContext<RatingItemContextValue | null>(null);
ItemContext.displayName = "RatingItemContext";
export const RatingItemContextProvider = ItemContext.Provider;
export function useRatingItemContext(): RatingItemContextValue {
  const context = useContext(ItemContext);
  if (!context) throw new Error("Rating.ItemContext requires Rating.Item");
  return context;
}
export function RatingContext({ children }: { children: (context: RatingContextValue) => ReactNode }) {
  return children(useRatingContext());
}
export function RatingItemContext({ children }: { children: (context: RatingItemContextValue) => ReactNode }) {
  return children(useRatingItemContext());
}

const RootContext = createContext<RatingContextValue | null>(null);
RootContext.displayName = "RatingContext";

export const RatingContextProvider = RootContext.Provider;

export function useRatingContext(): RatingContextValue {
  const ctx = useContext(RootContext);
  if (!ctx) {
    throw new Error("Rating compound components must be used within <RatingRoot>");
  }
  return ctx;
}
