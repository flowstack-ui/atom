import { forwardRef, type ReactNode } from "react";
import type { NativeHeadingProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

export type AccordionHeaderLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type AccordionHeaderNativeProps = NativeHeadingProps<"children">;

export interface AccordionHeaderProps extends AccordionHeaderNativeProps {
  /** Heading level. */
  as?: AccordionHeaderLevel;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Content. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  function AccordionHeader(
    {
      as = "h3",
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "accordion-header",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, as, { ...behaviorProps, children });
  },
);
