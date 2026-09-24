"use client";

import {
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemRoot,
  SwipeableItemRootProvider,
  SwipeableItemContext,
  useSwipeableItem,
} from "./primitives/swipeable-item/index.js";

export {
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemContextProvider,
  SwipeableItemRoot,
  SwipeableItemRootProvider,
  SwipeableItemContext,
  useSwipeableItem,
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
  SwipeableItemRootProviderProps,
  SwipeableItemController,
  UseSwipeableItemProps,
  SwipeableItemSide,
} from "./primitives/swipeable-item/index.js";

export const SwipeableItem = {
  Root: SwipeableItemRoot,
  RootProvider: SwipeableItemRootProvider,
  Context: SwipeableItemContext,
  Content: SwipeableItemContent,
  Actions: SwipeableItemActions,
} as const;
