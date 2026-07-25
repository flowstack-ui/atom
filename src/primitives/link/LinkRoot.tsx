import { forwardRef, type ReactNode } from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type LinkRootNativeProps = NativeAnchorProps<"children" | "href">;

interface LinkRootCommonProps extends LinkRootNativeProps {
  /** Link content. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

interface LinkRootDefaultProps extends LinkRootCommonProps {
  /** Native link destination. */
  href: string;
  /** Render the native anchor. */
  render?: undefined;
  /** Render the native anchor. */
  asChild?: false | undefined;
}

interface LinkRootRenderProps extends LinkRootCommonProps {
  /** Optional destination forwarded to the rendered link adapter. */
  href?: string;
  /** Override the rendered link element or adapt a router link. */
  render: RenderProp;
  asChild?: false | undefined;
}

interface LinkRootAsChildProps extends LinkRootCommonProps {
  /** Optional destination merged onto the child link adapter. */
  href?: string;
  render?: undefined;
  /** Merge props onto one child link element. */
  asChild: true;
}

export type LinkRootProps =
  | LinkRootDefaultProps
  | LinkRootRenderProps
  | LinkRootAsChildProps;

export const LinkRoot = forwardRef<HTMLAnchorElement, LinkRootProps>(
  function LinkRoot(
    {
      children,
      href,
      render,
      asChild,
      "data-slot": dataSlot = "link",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(href !== undefined ? { href } : {}),
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "a", {
      ...behaviorProps,
      children,
    });
  },
);
