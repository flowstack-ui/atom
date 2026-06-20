"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldsetContext } from "./context.js";

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
