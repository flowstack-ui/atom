"use client";

import {
  ToggleGroupItemRoot,
  ToggleGroupRoot,
} from "./primitives/toggle-group/index.js";

export {
  ToggleGroupContextProvider,
  ToggleGroupItemRoot,
  ToggleGroupRoot,
  useToggleGroupContext,
} from "./primitives/toggle-group/index.js";
export type {
  ToggleGroupContextValue,
  ToggleGroupItemRootProps,
  ToggleGroupRootProps,
} from "./primitives/toggle-group/index.js";

export const ToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItemRoot,
} as const;
