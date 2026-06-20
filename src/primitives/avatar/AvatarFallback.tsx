"use client";

import { forwardRef, useEffect, useState, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useAvatarContext } from "./context.js";

type AvatarFallbackNativeProps = NativeSpanProps<"children">;

export interface AvatarFallbackProps extends AvatarFallbackNativeProps {
  /** Delay in milliseconds before showing fallback during loading. */
  delayMs?: number;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Fallback content. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback(
    {
      delayMs,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "avatar-fallback",
      ...rest
    },
    ref,
  ) {
    const { status } = useAvatarContext();
    const [delayElapsed, setDelayElapsed] = useState(delayMs === undefined);

    useEffect(() => {
      if (delayMs === undefined) return undefined;

      const timer = setTimeout(() => setDelayElapsed(true), delayMs);
      return () => clearTimeout(timer);
    }, [delayMs]);

    if (status === "loaded") return null;
    if (status === "loading" && !delayElapsed) return null;

    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
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
