import type { ScrollTargetRoot } from "../../hooks/scrollTargets.js";

export interface TableOfContentsItemData { id: string; depth: number }
export interface TableOfContentsChangeDetails {
  reason: "scroll" | "navigation" | "hash" | "items";
}
export interface TableOfContentsOptions {
  items: readonly TableOfContentsItemData[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveIdChange?: (id: string, details: TableOfContentsChangeDetails) => void;
  enabled?: boolean;
  getTargetRoot?: () => ScrollTargetRoot | null;
  getScrollElement?: () => HTMLElement | null;
  scrollOffset?: number | (() => number);
  scrollBehavior?: "instant" | "smooth";
  navigation?: "native" | "managed";
  history?: "push" | "replace" | "none";
  focusTarget?: boolean;
}
export interface TableOfContentsItemState {
  current: boolean;
  visible: boolean;
  pending: boolean;
  depth: number;
  level: number;
  targetAvailable: boolean;
}
export interface TableOfContentsApi {
  activeId: string;
  visibleIds: readonly string[];
  pendingId: string;
  getItemState: (id: string) => TableOfContentsItemState;
  navigateTo: (id: string) => boolean;
  refresh: () => void;
}
