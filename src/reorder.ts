"use client";

import {
  ReorderDropIndicator,
  ReorderHandle,
  ReorderItem,
  ReorderMoveAfter,
  ReorderMoveBefore,
  ReorderMoveToEnd,
  ReorderMoveToStart,
  ReorderRoot,
  ReorderPreview,
} from "./primitives/reorder/index.js";

export * from "./primitives/reorder/index.js";

export const Reorder = {
  Preview: ReorderPreview,
  Root: ReorderRoot,
  Item: ReorderItem,
  Handle: ReorderHandle,
  MoveBefore: ReorderMoveBefore,
  MoveAfter: ReorderMoveAfter,
  MoveToStart: ReorderMoveToStart,
  MoveToEnd: ReorderMoveToEnd,
  DropIndicator: ReorderDropIndicator,
} as const;
