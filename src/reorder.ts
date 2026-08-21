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
} from "./primitives/reorder/index.js";

export * from "./primitives/reorder/index.js";

export const Reorder = {
  Root: ReorderRoot,
  Item: ReorderItem,
  Handle: ReorderHandle,
  MoveBefore: ReorderMoveBefore,
  MoveAfter: ReorderMoveAfter,
  MoveToStart: ReorderMoveToStart,
  MoveToEnd: ReorderMoveToEnd,
  DropIndicator: ReorderDropIndicator,
} as const;
