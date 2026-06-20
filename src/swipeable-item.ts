"use client";

import {
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemRoot,
} from "./primitives/swipeable-item/index.js";

export {
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemContextProvider,
  SwipeableItemRoot,
  clampSwipeableItemOffset,
  getSwipeableItemOffsetForSide,
  getSwipeableItemSideForOffset,
  getSwipeableItemSideFromKey,
  getSwipeableItemSizeForSide,
  useSwipeableItemContext,
} from "./primitives/swipeable-item/index.js";
export type {
  SwipeableItemActionsProps,
  SwipeableItemContentProps,
  SwipeableItemContextValue,
  SwipeableItemOpenSide,
  SwipeableItemRootProps,
  SwipeableItemSide,
} from "./primitives/swipeable-item/index.js";

export const SwipeableItem = {
  Root: SwipeableItemRoot,
  Content: SwipeableItemContent,
  Actions: SwipeableItemActions,
} as const;
