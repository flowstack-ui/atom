"use client";

import {
  forwardRef,
  cloneElement,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
  type ReactElement,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useBottomNavigationContext } from "./context.js";

type BottomNavigationItemNativeProps = NativeButtonProps<
  "children" | "disabled" | "onChange" | "value"
>;

export interface BottomNavigationItemProps extends BottomNavigationItemNativeProps {
  /** Destination value tracked by the root. */
  value: string;
  /** Link destination. When provided, the default element is an anchor. */
  href?: string;
  /** Link target for anchor rendering. */
  target?: string;
  /** Link relationship for anchor rendering. */
  rel?: string;
  /** Download the link resource instead of selecting a destination. */
  download?: string | boolean;
  /** Disabled destinations are skipped by interaction and announced as disabled. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Visual content rendered by the styled layer or consumer. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BottomNavigationItem = forwardRef<HTMLElement, BottomNavigationItemProps>(
  function BottomNavigationItem(
    {
      value,
      href,
      target,
      rel,
      disabled = false,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "bottom-nav-item",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const { value: activeValue, onChange, labelVisibility } = useBottomNavigationContext();
    const isActive = activeValue === value;
    const isLabelVisible =
      labelVisibility === "always" ||
      (labelVisibility === "active" && isActive);
    const defaultTag = href !== undefined ? "a" : "button";

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(
      (event) => {
        if (disabled || event.currentTarget.getAttribute("aria-disabled") === "true") {
          event.preventDefault();
          return;
        }

        const host = event.currentTarget;
        if (host.tagName === "A" && (
          event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          host.hasAttribute("download") ||
          (host.getAttribute("target") && host.getAttribute("target")?.toLowerCase() !== "_self")
        )) return;
        onChange(value);
      },
      [disabled, onChange, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(disabled ? { href: null } : href !== undefined ? { href } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(rel !== undefined ? { rel } : {}),
      "aria-current": isActive ? "page" : undefined,
      "aria-disabled": disabled || undefined,
      ...(disabled ? { tabIndex: -1 } : {}),
      "data-state": isActive ? "active" : "inactive",
      "data-slot": dataSlot,
      "data-value": value,
      ...(disabled ? { "data-disabled": "" } : {}),
      ...(isActive ? { "data-active": "" } : {}),
      ...(isLabelVisible ? { "data-label-visible": "" } : {}),
      onClick,
    };

    const element = asChild ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, defaultTag, { ...behaviorProps, children });
    const elementProps = element.props as Record<string, unknown>;
    // Normalize the actual intrinsic host after composition; custom adapters
    // must forward the public behavior props to their interactive element.
    const nativeProps = element.type === "button"
      ? { type: elementProps.type ?? "button", disabled: disabled || elementProps.disabled || undefined }
      : {};
    return cloneElement(element as ReactElement<Record<string, unknown>>, {
      ...nativeProps,
      onClick: composeEventHandlers(elementProps.onClick as MouseEventHandler<HTMLElement> | undefined, handleClick),
    });
  },
);
