"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
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
  "children" | "disabled" | "onChange" | "type" | "value"
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
    const { value: activeValue, onChange, showLabels } = useBottomNavigationContext();
    const isActive = activeValue === value;
    const isLabelVisible = showLabels || isActive;
    const defaultTag = href !== undefined ? "a" : "button";
    const isDefaultButton = !asChild && render === undefined && href === undefined;

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(
      (event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        onChange(value);
      },
      [disabled, onChange, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(href !== undefined && !disabled ? { href } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(rel !== undefined ? { rel } : {}),
      ...(isDefaultButton ? { type: "button", disabled: disabled || undefined } : {}),
      "aria-current": isActive ? "page" : undefined,
      "aria-disabled": disabled || undefined,
      ...(disabled ? { tabIndex: -1 } : {}),
      "data-state": isActive ? "active" : "inactive",
      "data-slot": dataSlot,
      "data-value": value,
      ...(disabled ? { "data-disabled": "" } : {}),
      ...(isActive ? { "data-active": "" } : {}),
      ...(isLabelVisible ? { "data-label-visible": "" } : {}),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, defaultTag, {
      ...behaviorProps,
      children,
    });
  },
);
