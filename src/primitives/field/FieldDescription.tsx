"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";
import { markFieldPart } from "./parts.js";

type FieldDescriptionNativeProps = NativeParagraphProps<"children">;

export interface FieldDescriptionProps extends FieldDescriptionNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  function FieldDescription(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "field-description",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldContext();
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback((node: HTMLParagraphElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = node && ctx ? ctx.registerPart("description") : null;
    }, [ctx]);
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: ctx?.descriptionId ?? restProps.id,
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

markFieldPart(FieldDescription, "description");
