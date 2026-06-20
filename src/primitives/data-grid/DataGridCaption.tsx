import { forwardRef, type ReactNode } from "react";
import type { NativeTableCaptionProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type DataGridCaptionNativeProps = NativeTableCaptionProps<"children">;

export interface DataGridCaptionProps extends DataGridCaptionNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridCaption = forwardRef<HTMLTableCaptionElement, DataGridCaptionProps>(
  function DataGridCaption(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "data-grid-caption",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "caption", { ...behaviorProps, children });
  },
);
