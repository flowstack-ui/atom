"use client";

import { FormRoot } from "./primitives/form/index.js";

export {
  FormContextProvider,
  FormRoot,
  useFormContext,
} from "./primitives/form/index.js";
export type {
  FormContextValue,
  FormRootProps,
} from "./primitives/form/index.js";

export const Form = {
  Root: FormRoot,
} as const;
