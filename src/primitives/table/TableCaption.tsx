import { forwardRef, type ReactNode } from "react";
import type { NativeTableCaptionProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableCaptionNativeProps = NativeTableCaptionProps<"children">;

export interface TableCaptionProps extends TableCaptionNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-caption",
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

    return renderElement(render, "caption", {
      ...behaviorProps,
      children,
    });
  },
);
