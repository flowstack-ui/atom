import type { DragDropPosition } from "../drag-drop/index.js";

export function reorderItems(
  items: readonly string[],
  activeValue: string,
  overValue: string,
  position: DragDropPosition,
): { items: string[]; previousIndex: number; nextIndex: number } {
  const previousIndex = items.indexOf(activeValue);
  const overIndex = items.indexOf(overValue);
  if (previousIndex < 0 || overIndex < 0 || activeValue === overValue || position === "on") {
    return { items: [...items], previousIndex, nextIndex: previousIndex };
  }
  const next = items.filter((item) => item !== activeValue);
  const targetIndex = next.indexOf(overValue);
  const insertionIndex = Math.max(0, targetIndex + (position === "after" ? 1 : 0));
  next.splice(insertionIndex, 0, activeValue);
  return { items: next, previousIndex, nextIndex: next.indexOf(activeValue) };
}
