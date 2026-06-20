"use client";

import { PressableRoot } from "./primitives/pressable/index.js";

export {
  PressableRoot,
} from "./primitives/pressable/index.js";
export type { PressableRootProps } from "./primitives/pressable/index.js";

export const Pressable = {
  Root: PressableRoot,
} as const;
