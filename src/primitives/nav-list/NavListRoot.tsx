"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeNavProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  NavListContextProvider,
  type NavListContextValue,
  type NavListOrientation,
} from "./context.js";

type NavListRootNativeProps = NativeNavProps<"children">;

export interface NavListRootProps extends NavListRootNativeProps {
  /** Navigation contents. */
  children?: ReactNode;
  /** Navigation orientation exposed through data attributes. @default "vertical" */
  orientation?: NavListOrientation;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListRoot = forwardRef<HTMLElement, NavListRootProps>(
  function NavListRoot(
    {
      children,
      orientation = "vertical",
      render,
      asChild,
      "data-slot": dataSlot = "nav-list",
      ...restProps
    },
    ref,
  ) {
    const contextValue = useMemo<NavListContextValue>(
      () => ({ orientation }),
      [orientation],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
    };

    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "nav", { ...behaviorProps, children });

    return (
      <NavListContextProvider value={contextValue}>
        {root}
      </NavListContextProvider>
    );
  },
);
