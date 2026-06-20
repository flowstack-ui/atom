"use client";

import { VisuallyHiddenRoot } from "./primitives/visually-hidden/index.js";

export {
  VisuallyHiddenRoot,
  visuallyHiddenStyle,
} from "./primitives/visually-hidden/index.js";
export type { VisuallyHiddenRootProps } from "./primitives/visually-hidden/index.js";

export const VisuallyHidden = {
  Root: VisuallyHiddenRoot,
} as const;
