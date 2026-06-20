"use client";

import { SwitchRoot, SwitchThumb } from "./primitives/switch/index.js";

export {
  SwitchContextProvider,
  SwitchRoot,
  SwitchThumb,
  useSwitchContext,
} from "./primitives/switch/index.js";
export type {
  SwitchContextValue,
  SwitchRootProps,
  SwitchThumbProps,
} from "./primitives/switch/index.js";

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;
