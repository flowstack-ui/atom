import { forwardRef, type ReactNode } from "react";
import type { NativeTableHeaderProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type DataGridHeaderNativeProps = NativeTableHeaderProps<"children" | "role">;

export interface DataGridHeaderProps extends DataGridHeaderNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridHeader = forwardRef<HTMLTableSectionElement, DataGridHeaderProps>(
  function DataGridHeader(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "data-grid-header",
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

    return renderElement(render, "thead", { ...behaviorProps, children });
  },
);
