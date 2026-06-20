"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  ScrollAreaContextProvider,
  type ScrollAreaContextValue,
  type ScrollAreaOrientation,
} from "./context.js";

type ScrollAreaRootNativeProps = NativeDivProps<"children">;

export interface ScrollAreaRootProps extends ScrollAreaRootNativeProps {
  /** Scroll direction for the area. */
  orientation?: ScrollAreaOrientation;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the scroll area root. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  function ScrollAreaRoot(
    {
      orientation = "vertical",
      render,
      asChild,
      children,
      "data-slot": dataSlot = "scroll-area",
      ...restProps
    },
    ref,
  ) {
    const contextValue = useMemo<ScrollAreaContextValue>(
      () => ({ orientation }),
      [orientation],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
    };

    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", {
        ...behaviorProps,
        children,
      });

    return (
      <ScrollAreaContextProvider value={contextValue}>
        {root}
      </ScrollAreaContextProvider>
    );
  },
);
