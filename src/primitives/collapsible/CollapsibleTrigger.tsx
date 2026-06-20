"use client";

import {
  forwardRef,
  type KeyboardEventHandler,
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
import { isToggleActivationKey } from "../toggle/ToggleRoot.js";
import { useCollapsibleContext } from "./context.js";

type CollapsibleTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "role" | "type"
>;

export interface CollapsibleTriggerProps extends CollapsibleTriggerNativeProps {
  /** Trigger content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    {
      children,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "collapsible-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const { isOpen, onToggle, contentId, triggerId, disabled } =
      useCollapsibleContext();
    const usesNativeButton = !asChild && (render === undefined || render === "button");

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!disabled) onToggle();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (!isToggleActivationKey(event.key)) return;

      event.preventDefault();
      if (!disabled) onToggle();
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: usesNativeButton ? "button" : undefined,
      role: usesNativeButton ? undefined : "button",
      id: triggerId,
      "data-slot": dataSlot,
      "data-state": isOpen ? "open" : "closed",
      ...(disabled ? { "data-disabled": "" } : {}),
      "aria-expanded": isOpen,
      "aria-controls": contentId,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? undefined : 0,
      disabled: usesNativeButton ? disabled || undefined : undefined,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
