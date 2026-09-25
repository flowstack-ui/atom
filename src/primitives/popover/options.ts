import type { AutoUpdateOptions, Boundary, Padding, Placement, Rect, Strategy, VirtualElement } from "@floating-ui/react";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";

export interface PopoverPositioningOptions {
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

export interface PopoverIds {
  trigger?: string | ((value?: string) => string);
  content?: string;
  title?: string;
  description?: string;
  anchor?: string;
  arrow?: string;
  close?: string;
}

export interface PopoverLifecycleOptions {
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  present?: boolean;
  onExitComplete?: () => void;
  immediate?: boolean;
  skipAnimationOnMount?: boolean;
  hideMode?: "display-none" | "activity";
}

export interface PopoverOutsideEvents {
  /** A containing active layer closed while this layer remained mounted. */
  onRequestDismiss?: (event: Event) => void;
  onInteractOutside?: (event: OutsideInteractionEvent | FocusEvent) => void;
  onPointerDownOutside?: (event: OutsideInteractionEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  persistentElements?: Array<() => HTMLElement | null>;
}
