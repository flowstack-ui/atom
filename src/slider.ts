"use client";

import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "./primitives/slider/index.js";

export {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderContextProvider,
  clampSliderValue,
  getClosestThumbIndex,
  getSliderRangeOffsetStyle,
  getSliderThumbOffsetStyle,
  percentToValue,
  snapToStep,
  useSliderContext,
  valueToPercent,
} from "./primitives/slider/index.js";
export type {
  SliderContextValue,
  SliderOrientation,
  SliderRangeProps,
  SliderRangeState,
  SliderRootProps,
  SliderThumbBehaviorProps,
  SliderThumbProps,
  SliderThumbState,
  SliderTrackProps,
  SliderValue,
} from "./primitives/slider/index.js";

export const Slider = {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
} as const;
