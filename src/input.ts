"use client";

import {
  InputClear,
  InputRoot,
} from "./primitives/input/index.js";

export {
  InputClear,
  InputContextProvider,
  InputRoot,
  useInputContext,
} from "./primitives/input/index.js";
export type {
  InputClearProps,
  InputContextValue,
  InputRootProps,
} from "./primitives/input/index.js";

export const Input = {
  Root: InputRoot,
  Clear: InputClear,
} as const;
