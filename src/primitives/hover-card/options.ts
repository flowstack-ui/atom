import type { AutoUpdateOptions, Boundary, Padding, Placement, Rect, Strategy, VirtualElement } from "@floating-ui/react";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";

export interface HoverCardPositioningOptions {
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
export interface HoverCardIds {
  trigger?: string | ((value?: string) => string);
  content?: string;
  arrow?: string;
}
export interface HoverCardLifecycleOptions {
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  present?: boolean;
  immediate?: boolean;
  skipAnimationOnMount?: boolean;
  hideMode?: "display-none" | "activity";
  onExitComplete?: () => void;
}
export interface HoverCardOutsideEvents {
  onInteractOutside?: (event: OutsideInteractionEvent | FocusEvent) => void;
  onPointerDownOutside?: (event: OutsideInteractionEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onRequestDismiss?: (event: Event) => void;
  persistentElements?: Array<() => HTMLElement | null>;
}
