"use client";

import {
  forwardRef,
  useCallback,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  hasNativeButtonKeyboardActivation,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useNavListContext, useNavListSectionContext } from "./context.js";

type NavListSectionTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "onKeyDown" | "role" | "type"
>;

export interface NavListSectionTriggerProps extends NavListSectionTriggerNativeProps {
  /** Trigger content. */
  children?: ReactNode;
  /** Click handler composed before Atom toggle behavior. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Key handler composed before Atom keyboard toggle behavior. */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /** Override the rendered trigger element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function isTriggerActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

export const NavListSectionTrigger = forwardRef<HTMLElement, NavListSectionTriggerProps>(
  function NavListSectionTrigger(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-section-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const { isOpen, collapsible, disabled, triggerId, contentId, toggle } =
      useNavListSectionContext();
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild ? childHasNativeButtonSemantics(children) : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));
    const needsButtonSemantics = !hasNativeSemantics;

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>(
      (event) => {
        if (disabled || !collapsible) {
          event.preventDefault();
          return;
        }

        toggle();
      },
      [collapsible, disabled, toggle],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (!isTriggerActivationKey(event.key)) {
          onKeyDown?.(event);
          return;
        }

        if (disabled || !collapsible) {
          event.preventDefault();
          return;
        }

        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (hasNativeButtonKeyboardActivation(event.currentTarget, event.key)) return;

        event.preventDefault();
        event.currentTarget.click();
      },
      [collapsible, disabled, onKeyDown],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isNativeButton ? { type: "button", disabled: disabled || undefined } : {}),
      ...(needsButtonSemantics
        ? { role: "button", tabIndex: disabled ? -1 : 0 }
        : {}),
      id: triggerId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      "data-state": isOpen ? "open" : "closed",
      ...(collapsible ? { "data-collapsible": "" } : {}),
      ...(disabled ? { "data-disabled": "" } : {}),
      "aria-expanded": collapsible ? isOpen : undefined,
      "aria-controls": collapsible ? contentId : undefined,
      "aria-disabled": !isNativeButton && disabled ? true : undefined,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: handleKeyDown,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);
