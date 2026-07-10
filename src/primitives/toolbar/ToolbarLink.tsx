"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
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
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  function ToolbarLink(
    {
      children,
      href,
      disabled = false,
      className,
      ariaLabel,
      onClick,
      onFocus,
      "data-slot": dataSlot = "toolbar-link",
      ...restProps
    },
    ref,
  ) {
    const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);

    const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
      }
    }, [disabled]);

    return (
      <a
        {...restProps}
        ref={composedRef}
        href={href}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-slot={dataSlot}
        {...(disabled ? { "data-disabled": "" } : {})}
        className={className}
        onClick={composeEventHandlers(onClick, handleClick)}
        onFocus={composeEventHandlers(onFocus, () => handleFocus())}
      >
        {children}
      </a>
    );
  },
);
