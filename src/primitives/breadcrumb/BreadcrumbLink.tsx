"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import { LinkRoot } from "../link/index.js";

type BreadcrumbLinkNativeProps = NativeAnchorProps<"children">;

export interface BreadcrumbLinkProps extends BreadcrumbLinkNativeProps {
  /** Link label. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb-link",
      ...restProps
    },
    ref,
  ) {
    if (asChild) {
      return (
        <LinkRoot {...restProps} ref={ref} asChild data-slot={dataSlot}>
          {children}
        </LinkRoot>
      );
    }

    return (
      <LinkRoot
        {...restProps}
        ref={ref}
        render={render ?? "a"}
        data-slot={dataSlot}
      >
        {children}
      </LinkRoot>
    );
  },
);
