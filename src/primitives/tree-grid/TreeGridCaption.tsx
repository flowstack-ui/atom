import { forwardRef, type ReactNode } from "react";
import type { NativeTableCaptionProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TreeGridCaptionNativeProps = NativeTableCaptionProps<"children">;

export interface TreeGridCaptionProps extends TreeGridCaptionNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridCaption = forwardRef<HTMLTableCaptionElement, TreeGridCaptionProps>(
  function TreeGridCaption(
    { children, render, asChild, "data-slot": dataSlot = "tree-grid-caption", ...restProps },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "caption", { ...behaviorProps, children });
  },
);
