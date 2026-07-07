"use client";

import { createContext, useContext } from "react";
import type { DirectionValue } from "../direction/index.js";
import type { RatingItemState } from "./utils.js";

export interface RatingContextValue {
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
}

const RatingContext = createContext<RatingContextValue | null>(null);
RatingContext.displayName = "RatingContext";

export const RatingContextProvider = RatingContext.Provider;

export function useRatingContext(): RatingContextValue {
  const ctx = useContext(RatingContext);
  if (!ctx) {
    throw new Error("Rating compound components must be used within <RatingRoot>");
  }
  return ctx;
}
