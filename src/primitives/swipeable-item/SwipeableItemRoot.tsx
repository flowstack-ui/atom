"use client";

import { forwardRef, useMemo, type CSSProperties, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { SwipeableItemContextProvider, useSwipeableItemContext } from "./context.js";
import { useSwipeableItem, type UseSwipeableItemProps, type SwipeableItemController } from "./useSwipeableItem.js";

export interface SwipeableItemRootProps extends NativeDivProps<"children" | "dir">, UseSwipeableItemProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export type SwipeableItemRootProviderProps = Omit<SwipeableItemRootProps, keyof UseSwipeableItemProps> & {
  value: SwipeableItemController;
};

export const SwipeableItemRootProvider = forwardRef<HTMLDivElement, SwipeableItemRootProviderProps>(
  function SwipeableItemRootProvider({ value, render, asChild, children, style, "data-slot": dataSlot = "swipeable-item", ...props }, ref) {
    const composedRef = useMemo(() => composeRefs(value.rootRef, ref), [value.rootRef, ref]);
    const behavior = {
      ...props, ref: composedRef, dir: value.dir,
      style: {
        ...style,
        "--atom-swipeable-item-offset": `${value.offset}px`,
        "--atom-swipeable-item-start-size": `${value.startSize}px`,
        "--atom-swipeable-item-end-size": `${value.endSize}px`,
      } as CSSProperties,
      "data-slot": dataSlot,
      "data-state": value.openSide ? "open" : "closed",
      "data-side": value.openSide ?? undefined,
      "data-dragging": value.dragging ? "" : undefined,
      "data-settling": value.settling ? "" : undefined,
      "data-armed": value.armedSide ?? undefined,
      "data-disabled": value.disabled ? "" : undefined,
      "data-readonly": value.readOnly ? "" : undefined,
      "data-motion": value.motion,
    };
    return <SwipeableItemContextProvider value={value}>
      {asChild ? cloneAndMerge(children, behavior) : renderElement(render, "div", { ...behavior, children })}
    </SwipeableItemContextProvider>;
  },
);

export const SwipeableItemRoot = forwardRef<HTMLDivElement, SwipeableItemRootProps>(
  function SwipeableItemRoot({
    openSide, defaultOpenSide, onOpenSideChange, onFullSwipe, fullSwipeSides,
    disabled, readOnly, threshold, thresholds, fullSwipeThreshold, activationDistance,
    velocityThreshold, resistance, closeOnOutsideClick, closeOnContentClick, motion, onSettle, dir,
    ...props
  }, ref) {
    const value = useSwipeableItem({
      openSide, defaultOpenSide, onOpenSideChange, onFullSwipe, fullSwipeSides,
      disabled, readOnly, threshold, thresholds, fullSwipeThreshold, activationDistance,
      velocityThreshold, resistance, closeOnOutsideClick, closeOnContentClick, motion, onSettle, dir,
    });
    return <SwipeableItemRootProvider {...props} ref={ref} value={value} />;
  },
);

export function SwipeableItemContext({ children }: { children: (value: SwipeableItemController) => ReactNode }) {
  return children(useSwipeableItemContext());
}
