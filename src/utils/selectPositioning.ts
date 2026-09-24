import type { Padding, Placement, Strategy } from "@floating-ui/react";

/** Shared positioning policy for the two select-only popup owners. */
export interface SelectPositioningOptions {
  placement?: Placement;
  strategy?: Strategy;
  gutter?: number;
  flip?: boolean;
  slide?: boolean;
  overflowPadding?: Padding;
  sameWidth?: boolean;
  hideWhenDetached?: boolean;
}
