"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useToolbarItem } from "./useToolbarItem.js";

type ToolbarLinkNativeProps = NativeAnchorProps<"children" | "href">;

export interface ToolbarLinkProps extends ToolbarLinkNativeProps {
  /** Link content. */
  children?: ReactNode;
  /** Link destination. */
  href: string;
  /** Link target. */
  target?: string;
  /** Link rel. */
  rel?: string;
  /** Disable this link. */
  disabled?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  function ToolbarLink(
    {
      children,
      href,
      target,
      rel,
      disabled = false,
      className,
      ariaLabel,
      render,
      asChild,
      onClick,
      onFocus,
      "data-slot": dataSlot = "toolbar-link",
      ...restProps
    },
    ref,
  ) {
    const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);

    const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
      }
    }, [disabled]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      href,
      ...(target !== undefined && { target }),
      ...(rel !== undefined && { rel }),
      tabIndex,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-disabled": disabled || undefined,
      "data-slot": dataSlot,
      ...(disabled ? { "data-disabled": "" } : {}),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
      onFocus: composeEventHandlers(onFocus, () => handleFocus()),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "a", { ...behaviorProps, children });
  },
);
