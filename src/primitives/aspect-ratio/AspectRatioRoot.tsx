"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type AspectRatioRootNativeProps = NativeDivProps<"children">;

export interface AspectRatioRootProps extends AspectRatioRootNativeProps {
  /** Content constrained by the aspect ratio. */
  children?: ReactNode;
  /** Aspect ratio as width / height. @default 16 / 9 */
  ratio?: number;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function normalizeAspectRatio(ratio: number): number {
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9;
}

export const AspectRatioRoot = forwardRef<HTMLDivElement, AspectRatioRootProps>(
  function AspectRatioRoot(
    {
      children,
      ratio = 16 / 9,
      render,
      asChild,
      style,
      "data-slot": dataSlot = "aspect-ratio",
      ...restProps
    },
    ref,
  ) {
    const resolvedRatio = normalizeAspectRatio(ratio);
    const resolvedStyle: CSSProperties = {
      ...style,
      aspectRatio: resolvedRatio,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      style: resolvedStyle,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
