"use client";

import {
  createContext,
  useContext,
  type PointerEvent,
  type RefObject,
} from "react";
import type { SliderOrientation, SliderThumbBehaviorProps } from "./SliderRoot.js";

export interface SliderRangeState {
  minPercent: number;
  maxPercent: number;
  startPercent: number;
  endPercent: number;
}

export interface SliderThumbState {
  index: number;
  value: number;
  percent: number;
}

export interface SliderContextValue {
  values: number[];
  isRange: boolean;
  min: number;
  max: number;
  step: number;
  orientation: SliderOrientation;
  disabled: boolean;
  trackRef: RefObject<HTMLDivElement | null>;
  valueToPercent: (value: number) => number;
  getThumbProps: (thumbIndex: number) => SliderThumbBehaviorProps;
  getThumbState: (thumbIndex: number) => SliderThumbState;
  getRangeState: () => SliderRangeState;
  handleTrackPointerDown: (event: PointerEvent) => void;
  handlePointerMove: (event: PointerEvent) => void;
  handlePointerUp: () => void;
}

const SliderContext = createContext<SliderContextValue | null>(null);
SliderContext.displayName = "SliderContext";

export const SliderContextProvider = SliderContext.Provider;

export function useSliderContext(): SliderContextValue {
  const context = useContext(SliderContext);

  if (!context) {
    throw new Error("Slider primitives must be used within Slider.Root");
  }

  return context;
}

export function getSliderThumbOffsetStyle(
  orientation: SliderOrientation,
  percent: number,
): Record<string, string> {
  return orientation === "horizontal"
    ? { insetInlineStart: `${percent}%` }
    : { insetBlockEnd: `${percent}%` };
}

export function getSliderRangeOffsetStyle(
  orientation: SliderOrientation,
  range: SliderRangeState,
): Record<string, string> {
  return orientation === "horizontal"
    ? {
        insetInlineStart: `${range.startPercent}%`,
        insetInlineEnd: `${100 - range.endPercent}%`,
      }
    : {
        insetBlockStart: `${100 - range.endPercent}%`,
        insetBlockEnd: `${range.startPercent}%`,
      };
}
