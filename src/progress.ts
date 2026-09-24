"use client";

import {
  ProgressIndicator,
  ProgressRoot,
  ProgressRootProvider,
  ProgressContextView,
} from "./primitives/progress/index.js";

export {
  ProgressContextProvider,
  ProgressContextView,
  ProgressRootProvider,
  ProgressIndicator,
  ProgressRoot,
  clampProgressValue,
  getProgressPercent,
  getProgressState,
  useProgressContext,
  useProgress,
} from "./primitives/progress/index.js";
export type {
  ProgressContextValue,
  ProgressContextProps,
  ProgressController,
  ProgressIds,
  UseProgressProps,
  ProgressRootProviderProps,
  ProgressDataState,
  ProgressIndicatorProps,
  ProgressRootProps,
  ProgressState,
  ProgressStateOptions,
} from "./primitives/progress/index.js";

export const Progress = {
  Root: ProgressRoot,
  RootProvider: ProgressRootProvider,
  Context: ProgressContextView,
  Indicator: ProgressIndicator,
} as const;
