import { type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import type { ToolbarOrientation } from "./context.js";

type ToolbarSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface ToolbarSeparatorProps extends ToolbarSeparatorNativeProps {
  /** Separator orientation. */
  orientation?: ToolbarOrientation;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Children, usually empty. */
  children?: ReactNode;
}

export function ToolbarSeparator({
  orientation = "vertical",
  className,
  ...restProps
}: ToolbarSeparatorProps) {
  return (
    <div
      {...restProps}
      role="separator"
      aria-orientation={orientation}
      data-slot="toolbar-separator"
      data-orientation={orientation}
      className={className}
    />
  );
}
