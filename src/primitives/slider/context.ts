"use client";

import { createContext, useContext } from "react";
import type { SliderController, SliderOrientation, SliderRangeState } from "./useSlider.js";

const SliderContext = createContext<SliderController | null>(null);
SliderContext.displayName = "SliderContext";

export const SliderContextProvider = SliderContext.Provider;

export function useSliderContext(): SliderController {
  const context = useContext(SliderContext);
  if (!context) throw new Error("Slider primitives must be used within Slider.Root or Slider.RootProvider");
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
    ? { insetInlineStart: `${range.startPercent}%`, insetInlineEnd: `${100 - range.endPercent}%` }
    : { insetBlockStart: `${100 - range.endPercent}%`, insetBlockEnd: `${range.startPercent}%` };
}

export type SliderContextValue = SliderController;
export type { SliderRangeState, SliderThumbState } from "./useSlider.js";
