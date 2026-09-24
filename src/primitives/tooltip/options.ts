import type { AutoUpdateOptions, Boundary, Padding, Placement, Rect, Strategy, VirtualElement } from "@floating-ui/react";

export interface TooltipPositioningOptions {
  placement?: Placement;
  strategy?: Strategy;
  gutter?: number;
  offset?: { mainAxis?: number; crossAxis?: number };
  shift?: number;
  flip?: boolean | Placement[];
  slide?: boolean;
  overlap?: boolean;
  overflowPadding?: Padding;
  boundary?: Boundary | (() => Boundary);
  sameWidth?: boolean;
  fitViewport?: boolean;
  hideWhenDetached?: boolean;
  listeners?: boolean | AutoUpdateOptions;
  sizeMiddleware?: boolean;
  animationFrame?: boolean;
  arrowPadding?: number;
  getAnchorRect?: () => Rect | null;
  getAnchorElement?: () => HTMLElement | VirtualElement | null;
  onPositioned?: (details: { placed: boolean }) => void;
}

export interface TooltipIds {
  trigger?: string | ((value?: string) => string);
  content?: string;
  arrow?: string;
}

export interface TooltipLifecycleOptions {
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  present?: boolean;
  onExitComplete?: () => void;
  immediate?: boolean;
  skipAnimationOnMount?: boolean;
  hideMode?: "display-none" | "activity";
}
