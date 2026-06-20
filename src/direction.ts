"use client";

import { DirectionProvider } from "./primitives/direction/index.js";

export {
  DirectionProvider,
  defaultDirection,
  useDirection,
} from "./primitives/direction/index.js";
export type {
  DirectionProviderProps,
  DirectionValue,
} from "./primitives/direction/index.js";

export const Direction = {
  Provider: DirectionProvider,
} as const;
