import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

export type AppBarDensity = "compact" | "comfortable";

type AppBarToolbarNativeProps = NativeDivProps<"children">;

export interface AppBarToolbarProps extends AppBarToolbarNativeProps {
  /** Toolbar layout content. This is not an ARIA toolbar. */
  children?: ReactNode;
  /** Layout density exposed as a data attribute for the styled layer. */
  density?: AppBarDensity;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge toolbar props onto a single child. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AppBarToolbar = forwardRef<HTMLDivElement, AppBarToolbarProps>(
  function AppBarToolbar(
    {
      children,
      density = "comfortable",
      render,
      asChild,
      "data-slot": dataSlot = "appbar-toolbar",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-density": density,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
