"use client";

import {
  DragDropDraggable,
  DragDropDropTarget,
  DragDropHandle,
  DragDropRoot,
} from "./primitives/drag-drop/index.js";

export * from "./primitives/drag-drop/index.js";

export const DragDrop = {
  Root: DragDropRoot,
  Draggable: DragDropDraggable,
  DropTarget: DragDropDropTarget,
  Handle: DragDropHandle,
} as const;
