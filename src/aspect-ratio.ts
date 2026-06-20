"use client";

import { AspectRatioRoot } from "./primitives/aspect-ratio/index.js";

export { AspectRatioRoot };
export type { AspectRatioRootProps } from "./primitives/aspect-ratio/index.js";

export const AspectRatio = {
  Root: AspectRatioRoot,
} as const;
