"use client";

import {
  FieldsetContext,
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
  markFieldsetPart,
  useFieldsetContext,
  useRequiredFieldsetContext,
} from "./primitives/fieldset/index.js";
export type {
  FieldsetContextValue,
  FieldsetDescriptionProps,
  FieldsetErrorProps,
  FieldsetLegendProps,
  FieldsetRootProps,
  FieldsetPartKind,
} from "./primitives/fieldset/index.js";

export const Fieldset = {
  Context: FieldsetContext,
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Description: FieldsetDescription,
  Error: FieldsetError,
} as const;
export { FieldsetContext } from "./primitives/fieldset/index.js";
export type { FieldsetContextProps } from "./primitives/fieldset/index.js";
