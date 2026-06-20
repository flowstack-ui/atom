"use client";

import {
  FieldsetDescription,
  FieldsetError,
  FieldsetLegend,
  FieldsetRoot,
} from "./primitives/fieldset/index.js";

export {
  FieldsetContextProvider,
  FieldsetDescription,
  FieldsetError,
  FieldsetLegend,
  FieldsetRoot,
  useFieldsetContext,
  useRequiredFieldsetContext,
} from "./primitives/fieldset/index.js";
export type {
  FieldsetContextValue,
  FieldsetDescriptionProps,
  FieldsetErrorProps,
  FieldsetLegendProps,
  FieldsetRootProps,
} from "./primitives/fieldset/index.js";

export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Description: FieldsetDescription,
  Error: FieldsetError,
} as const;
