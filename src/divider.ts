"use client";

import { DividerRoot } from "./primitives/divider/index.js";

export { DividerRoot } from "./primitives/divider/index.js";
export type {
  DividerOrientation,
  DividerRootProps,
} from "./primitives/divider/index.js";

export const Divider = {
  Root: DividerRoot,
} as const;
