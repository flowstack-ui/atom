import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type HighlightMatchNativeProps = Omit<ComponentPropsWithoutRef<"mark">, "children">;

export interface HighlightMatchProps extends HighlightMatchNativeProps {
  /** Matched text. */
  children?: ReactNode;
  /** Override the rendered match element. */
  render?: RenderProp;
  /** Merge match props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const HighlightMatch = forwardRef<HTMLElement, HighlightMatchProps>(
  function HighlightMatch(
    {
      render,
      asChild,
      children,
      "data-slot": dataSlot = "highlight-match",
      ...rest
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);

    return renderElement(render, "mark", {
      ...behaviorProps,
      children,
    });
  },
);
