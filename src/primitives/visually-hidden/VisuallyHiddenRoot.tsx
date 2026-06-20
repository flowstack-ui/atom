"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type VisuallyHiddenRootNativeProps = NativeSpanProps<"children" | "style">;

export interface VisuallyHiddenRootProps extends VisuallyHiddenRootNativeProps {
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Accessible content hidden from visual rendering. */
  children?: ReactNode;
  /** Inline styles merged before Atom's hiding styles. */
  style?: CSSProperties;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  overflowWrap: "normal",
};

export const VisuallyHiddenRoot = forwardRef<HTMLSpanElement, VisuallyHiddenRootProps>(
  function VisuallyHiddenRoot(
    {
      render,
      asChild,
      children,
      style,
      "data-slot": dataSlot = "visually-hidden",
      ...rest
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
      // These styles are accessibility behavior. Consumer style is preserved,
      // but the hiding contract remains authoritative.
      style: { ...style, ...visuallyHiddenStyle },
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children,
    });
  },
);
