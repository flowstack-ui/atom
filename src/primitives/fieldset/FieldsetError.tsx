"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldsetContext } from "./context.js";
import { markFieldsetPart } from "./parts.js";

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

markFieldsetPart(FieldsetError, "error");
