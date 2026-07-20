"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldsetContext } from "./context.js";
import { markFieldsetPart } from "./parts.js";

type FieldsetDescriptionNativeProps = NativeParagraphProps<"children">;

export interface FieldsetDescriptionProps extends FieldsetDescriptionNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldsetDescription = forwardRef<
  HTMLParagraphElement,
  FieldsetDescriptionProps
>(
  function FieldsetDescription(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "fieldset-description",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldsetContext();
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

markFieldsetPart(FieldsetDescription, "description");
