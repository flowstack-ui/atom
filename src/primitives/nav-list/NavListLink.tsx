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
import { type NavListCurrentValue, useNavListContext } from "./context.js";

type NavListLinkNativeProps = NativeAnchorProps<"children" | "aria-current">;

export interface NavListLinkProps extends NavListLinkNativeProps {
  /** Link content. */
  children?: ReactNode;
  /** Whether this link represents the current route or section. */
  active?: boolean;
  /** Current item token used for `aria-current` when active. @default "page" */
  current?: NavListCurrentValue;
  /** Mark the link unavailable and prevent navigation. */
  disabled?: boolean;
  /** Override the rendered link element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element, such as a framework router link. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
  /** ARIA current token override. */
  "aria-current"?: NavListCurrentValue;
}

export const NavListLink = forwardRef<HTMLAnchorElement, NavListLinkProps>(
  function NavListLink(
    {
      children,
      active = false,
      current = "page",
      disabled = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-link",
      "aria-current": ariaCurrent,
      onClick,
      href,
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const resolvedAriaCurrent = ariaCurrent ?? (active ? current : undefined);

    const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
      (event) => {
        if (!disabled) return;
        event.preventDefault();
      },
      [disabled],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(href !== undefined && !disabled ? { href } : {}),
      "aria-current": resolvedAriaCurrent ?? undefined,
      "aria-disabled": disabled || undefined,
      ...(disabled ? { tabIndex: -1 } : {}),
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(active ? { "data-active": "", "data-current": "" } : {}),
      ...(disabled ? { "data-disabled": "" } : {}),
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
