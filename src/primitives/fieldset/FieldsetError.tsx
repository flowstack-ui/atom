"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldsetContext } from "./context.js";

type FieldsetErrorNativeProps = NativeParagraphProps<"children">;

export interface FieldsetErrorProps extends FieldsetErrorNativeProps {
  children: ReactNode;
  forceMatch?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldsetError = forwardRef<HTMLParagraphElement, FieldsetErrorProps>(
  function FieldsetError(
    {
      children,
      forceMatch = false,
      render,
      asChild,
      "data-slot": dataSlot = "fieldset-error",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldsetContext();
    const shouldShow = forceMatch || (ctx?.invalid ?? false);
    const setHasError = ctx?.setHasError;

    useEffect(() => {
      if (!shouldShow) return undefined;
      setHasError?.(true);
      return () => setHasError?.(false);
    }, [setHasError, shouldShow]);

    if (!shouldShow) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: ctx?.errorId ?? restProps.id,
      role: "alert",
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "p", {
      ...behaviorProps,
      children,
    });
  },
);
