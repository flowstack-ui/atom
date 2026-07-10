import { type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import type { ToolbarOrientation } from "./context.js";

type ToolbarSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface ToolbarSeparatorProps extends ToolbarSeparatorNativeProps {
  /** Separator orientation. */
  orientation?: ToolbarOrientation;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Children, usually empty. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export function ToolbarSeparator({
  orientation = "vertical",
  render,
  asChild,
  className,
  children,
  "data-slot": dataSlot = "toolbar-separator",
  ...restProps
}: ToolbarSeparatorProps) {
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    role: "separator",
    "aria-orientation": orientation,
    "data-slot": dataSlot,
    "data-orientation": orientation,
    className,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", { ...behaviorProps, children });
}
