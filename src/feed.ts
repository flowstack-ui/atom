"use client";

import { FeedItem, FeedRoot } from "./primitives/feed/index.js";

export {
  FeedContextProvider,
  FeedItem,
  FeedRoot,
  useFeedContext,
} from "./primitives/feed/index.js";
export type {
  FeedContextValue,
  FeedItemProps,
  FeedRootProps,
  FeedSetSize,
} from "./primitives/feed/index.js";

export const Feed = {
  Root: FeedRoot,
  Item: FeedItem,
} as const;
