"use client";

import {
  SkipLinkRoot,
  SkipLinkTarget,
} from "./primitives/skip-link/index.js";

export {
  SkipLinkRoot,
  SkipLinkTarget,
} from "./primitives/skip-link/index.js";
export type {
  SkipLinkRootProps,
  SkipLinkTargetProps,
} from "./primitives/skip-link/index.js";

export const SkipLink = {
  Root: SkipLinkRoot,
  Target: SkipLinkTarget,
} as const;
