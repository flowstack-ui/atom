import type { RefCallback } from "react";
import type { ScrollAreaOrientation } from "./context.js";

export type ScrollAreaAxis = "horizontal" | "vertical";
export type ScrollAreaEdge = "top" | "right" | "bottom" | "left";
export interface ScrollAreaIds {
  root?: string;
  viewport?: string;
  content?: string;
  corner?: string;
  scrollbar?: string;
  thumb?: string;
}
export interface UseScrollAreaProps {
  orientation?: ScrollAreaOrientation;
  ids?: ScrollAreaIds;
}
export interface ScrollAreaScrollToDetails {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
  duration?: number;
  easing?: (progress: number) => number;
}
export interface ScrollAreaScrollToEdgeDetails
  extends Omit<ScrollAreaScrollToDetails, "top" | "left"> {
  edge: ScrollAreaEdge;
}
export interface ScrollAreaScrollbarState {
  hidden: boolean;
  hovering: boolean;
  scrolling: boolean;
  dragging: boolean;
}
export interface ScrollAreaState {
  isAtTop: boolean;
  isAtBottom: boolean;
  isAtLeft: boolean;
  isAtRight: boolean;
  hasOverflowX: boolean;
  hasOverflowY: boolean;
}
export interface ScrollAreaController extends ScrollAreaState {
  readonly orientation: ScrollAreaOrientation;
  readonly viewportRef: RefCallback<HTMLDivElement>;
  readonly contentRef: RefCallback<HTMLDivElement>;
  getScrollProgress(): { x: number; y: number };
  scrollTo(details: ScrollAreaScrollToDetails): void;
  scrollToEdge(details: ScrollAreaScrollToEdgeDetails): void;
  getScrollbarState(details: {
    orientation?: ScrollAreaAxis;
  }): ScrollAreaScrollbarState;
}
