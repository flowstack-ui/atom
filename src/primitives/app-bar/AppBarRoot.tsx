import { forwardRef, type ReactNode } from "react";
import type { NativeHeaderProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

export type AppBarPosition = "static" | "absolute" | "sticky" | "fixed";

type AppBarRootNativeProps = NativeHeaderProps<"children">;

export interface AppBarRootProps extends AppBarRootNativeProps {
  /** App bar content. Prefer composing `AppBar.Toolbar` and section slots. */
  children?: ReactNode;
  /**
   * Positioning mode exposed as a data attribute for the styled layer.
   *
   * Add an accessible name such as `aria-label` when rendering more than one
   * app bar/header landmark on the same page.
   */
  position?: AppBarPosition;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge app bar props onto a single child. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AppBarRoot = forwardRef<HTMLElement, AppBarRootProps>(
  function AppBarRoot(
    {
      children,
      position = "static",
      render,
      asChild,
      "data-slot": dataSlot = "appbar",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-position": position,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "header", {
      ...behaviorProps,
      children,
    });
  },
);
