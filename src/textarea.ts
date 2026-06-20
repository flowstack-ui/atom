"use client";

import {
  TextareaCount,
  TextareaRoot,
} from "./primitives/textarea/index.js";

export {
  TextareaContextProvider,
  TextareaCount,
  TextareaRoot,
  useTextareaContext,
} from "./primitives/textarea/index.js";
export type {
  TextareaContextValue,
  TextareaCountProps,
  TextareaRootProps,
} from "./primitives/textarea/index.js";

export const Textarea = {
  Root: TextareaRoot,
  Count: TextareaCount,
} as const;
