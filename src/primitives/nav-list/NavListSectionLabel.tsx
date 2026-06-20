"use client";

import { forwardRef, useEffect, type ReactNode } from "react";
import type { NativeHeadingProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNavListContext, useNavListSectionContext } from "./context.js";

export type NavListSectionLabelElement = "h2" | "h3" | "h4" | "h5" | "h6" | "div";

type NavListSectionLabelNativeProps = NativeHeadingProps<"children" | "id">;

export interface NavListSectionLabelProps extends NavListSectionLabelNativeProps {
  /** Section label content. */
  children?: ReactNode;
  /** Heading element used for the section label. @default "h2" */
  as?: NavListSectionLabelElement;
  /** Override the rendered label element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListSectionLabel = forwardRef<HTMLElement, NavListSectionLabelProps>(
  function NavListSectionLabel(
    {
      children,
      as = "h2",
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-section-label",
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const { labelId, registerLabel, unregisterLabel } = useNavListSectionContext();

    useEffect(() => {
      registerLabel();
      return unregisterLabel;
    }, [registerLabel, unregisterLabel]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: labelId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, as, {
      ...behaviorProps,
      children,
    });
  },
);
