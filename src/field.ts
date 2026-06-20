"use client";

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
} from "./primitives/field/index.js";

export {
  FieldContextProvider,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
  useFieldContext,
  useRequiredFieldContext,
} from "./primitives/field/index.js";
export type {
  FieldContextValue,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldLabelProps,
  FieldOrientation,
  FieldRequiredIndicatorProps,
  FieldRootProps,
} from "./primitives/field/index.js";

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  RequiredIndicator: FieldRequiredIndicator,
} as const;
