"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type SkipLinkRootNativeProps = NativeAnchorProps<"children" | "href" | "onClick">;

export interface SkipLinkRootProps extends SkipLinkRootNativeProps {
  /** Hash target for the skip link. */
  href?: `#${string}`;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Link content. */
  children?: ReactNode;
  /** Focus and scroll the hash target on activation. */
  focusTarget?: boolean;
  /** Called when the link is activated. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SkipLinkRoot = forwardRef<HTMLAnchorElement, SkipLinkRootProps>(
  function SkipLinkRoot(
    {
      render,
      asChild,
      children = "Skip to main content",
      href = "#main-content",
      focusTarget = true,
      onClick,
      "data-slot": dataSlot = "skip-link",
      ...restProps
    },
    ref,
  ) {
    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
      (event) => {
        if (!focusTarget) return;
        const targetId = href.slice(1);
        if (!targetId) return;

        let decodedId = targetId;
        try {
          decodedId = decodeURIComponent(targetId);
        } catch {
          decodedId = targetId;
        }

        const target = document.getElementById(decodedId);
        if (!target) return;

        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start" });
      },
      [focusTarget, href],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      href,
      "data-slot": dataSlot,
      onClick: composeEventHandlers(onClick, handleClick),
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
