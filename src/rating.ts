"use client";

import {
  RatingItem,
  RatingRoot,
  RatingRootProvider, RatingLabel, RatingControl, RatingHiddenInput, RatingContext, RatingItemContext,
} from "./primitives/rating/index.js";

export {
  RatingContextProvider,
  RatingItem,
  RatingRoot,
  clampRatingValue,
  getRatingItemState,
  getRatingValueLabel,
  normalizeRatingRange,
  snapRatingValue,
  useRatingContext,
} from "./primitives/rating/index.js";
export type {
  RatingContextValue,
  RatingItemDataState,
  RatingItemProps,
  RatingItemState,
  RatingRange,
  RatingRootProps,
} from "./primitives/rating/index.js";

export const Rating = {
  RootProvider: RatingRootProvider, Label: RatingLabel, Control: RatingControl,
  HiddenInput: RatingHiddenInput, Context: RatingContext, ItemContext: RatingItemContext,
  Root: RatingRoot,
  Item: RatingItem,
} as const;

export { RatingRootProvider, RatingLabel, RatingControl, RatingHiddenInput, RatingContext, RatingItemContext, useRating, useRatingItemContext } from "./primitives/rating/index.js";
export type { RatingRootProviderProps, RatingLabelProps, RatingControlProps, RatingHiddenInputProps, RatingController, UseRatingProps, RatingItemContextValue } from "./primitives/rating/index.js";
