"use client";

import {
  RatingItem,
  RatingRoot,
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
  Root: RatingRoot,
  Item: RatingItem,
} as const;
