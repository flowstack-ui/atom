import { forwardRef, type ReactNode } from "react";
import type { NativeTableFooterProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type DataGridFooterNativeProps = NativeTableFooterProps<"children" | "role">;

export interface DataGridFooterProps extends DataGridFooterNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridFooter = forwardRef<HTMLTableSectionElement, DataGridFooterProps>(
  function DataGridFooter(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "data-grid-footer",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "rowgroup",
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "tfoot", { ...behaviorProps, children });
  },
);
