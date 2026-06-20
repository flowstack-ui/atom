import { forwardRef, type ReactNode } from "react";
import type { NativeTableFooterProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableFooterNativeProps = NativeTableFooterProps<"children">;

export interface TableFooterProps extends TableFooterNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  function TableFooter(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-footer",
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

    return renderElement(render, "tfoot", {
      ...behaviorProps,
      children,
    });
  },
);
