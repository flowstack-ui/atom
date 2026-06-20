"use client";

import {
  ProgressIndicator,
  ProgressRoot,
} from "./primitives/progress/index.js";

export {
  ProgressContextProvider,
  ProgressIndicator,
  ProgressRoot,
  clampProgressValue,
  getProgressPercent,
  getProgressState,
  useProgressContext,
} from "./primitives/progress/index.js";
export type {
  ProgressContextValue,
  ProgressDataState,
  ProgressIndicatorProps,
  ProgressRootProps,
  ProgressState,
  ProgressStateOptions,
} from "./primitives/progress/index.js";

export const Progress = {
  Root: ProgressRoot,
  Indicator: ProgressIndicator,
} as const;
