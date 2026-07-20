"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";
import { markFieldPart } from "./parts.js";

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
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback((node: HTMLParagraphElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = node && ctx ? ctx.registerPart("error") : null;
    }, [ctx]);
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );

    if (!shouldShow) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: ctx?.errorId ?? restProps.id,
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

markFieldPart(FieldError, "error");
