"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useScrollAreaContext, useScrollAreaEngine } from "./context.js";

type ScrollAreaViewportNativeProps = NativeDivProps<"children">;

export interface ScrollAreaViewportProps extends ScrollAreaViewportNativeProps {
  /** Opt the scrollable viewport into the Tab order. */
  focusable?: boolean;
  /** Override the rendered viewport element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the scrollable viewport. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ScrollAreaViewport = forwardRef<
  HTMLDivElement,
  ScrollAreaViewportProps
>(function ScrollAreaViewport(
  {
    focusable = false,
    render,
    asChild,
    children,
    role,
    tabIndex,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "data-slot": dataSlot = "scroll-area-viewport",
    ...restProps
  },
  ref,
) {
  const { orientation } = useScrollAreaContext();
  const engine = useScrollAreaEngine();
  const mergedRef = useMemo(
    () => composeRefs(engine?.api.viewportRef, ref),
    [engine, ref],
  );
  const hasAccessibleName =
    ariaLabel !== undefined || ariaLabelledBy !== undefined;
  const requestedRole = role ?? (hasAccessibleName ? "region" : undefined);
  const resolvedRole =
    requestedRole === "region" && !hasAccessibleName
      ? undefined
      : requestedRole;

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: mergedRef,
    id: restProps.id ?? engine?.id("viewport"),
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      restProps.onScroll?.(event);
      engine?.onScroll();
    },
    onWheel: (event: React.WheelEvent<HTMLDivElement>) => {
      restProps.onWheel?.(event);
      engine?.cancel();
    },
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {
      restProps.onTouchStart?.(event);
      engine?.cancel();
    },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      restProps.onPointerDown?.(event);
      engine?.cancel();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      restProps.onKeyDown?.(event);
      engine?.cancel();
    },
    role: resolvedRole,
    tabIndex: tabIndex ?? (focusable ? 0 : undefined),
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "data-slot": dataSlot,
    "data-orientation": orientation,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", {
    ...behaviorProps,
    children,
  });
});
