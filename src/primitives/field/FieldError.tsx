"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";

type FieldErrorNativeProps = NativeParagraphProps<"children">;

export interface FieldErrorProps extends FieldErrorNativeProps {
  children: ReactNode;
  match?: boolean;
  forceMatch?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  function FieldError(
    {
      children,
      match,
      forceMatch = false,
      render,
      asChild,
      "data-slot": dataSlot = "field-error",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldContext();
    const isInvalid = ctx?.invalid ?? false;
    const shouldShow =
      forceMatch ||
      (isInvalid && (match === undefined || match === true));
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
