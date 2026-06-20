"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";

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
    const setHasDescription = ctx?.setHasDescription;

    useEffect(() => {
      setHasDescription?.(true);
      return () => setHasDescription?.(false);
    }, [setHasDescription]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
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
