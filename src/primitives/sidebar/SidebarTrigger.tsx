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
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { type SidebarState, useSidebarContext } from "./context.js";

type SidebarTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "role" | "type"
>;

export interface SidebarTriggerProps extends SidebarTriggerNativeProps {
  /** State to set when the trigger is activated. Defaults to toggling. */
  toState?: SidebarState;
  /** Trigger content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function isSidebarTriggerActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger(
    {
      toState,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "sidebar-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const { state, side, collapsedState, disabled, panelId, triggerId, toggle, setState } =
      useSidebarContext();

    const activate = useCallback(() => {
      if (disabled) return;
      if (toState) {
        setState(toState);
        return;
      }
      toggle();
    }, [disabled, setState, toState, toggle]);

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
      activate();
    }, [activate]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLButtonElement>>((event) => {
      if (!isSidebarTriggerActivationKey(event.key)) return;

      event.preventDefault();
      activate();
    }, [activate]);

    const nextState = toState ?? (state === "expanded" ? collapsedState : "expanded");
    const shouldExposeButtonRole =
      asChild || (render !== undefined && render !== "button");
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      role: shouldExposeButtonRole ? "button" : undefined,
      id: triggerId,
      "data-slot": dataSlot,
      "data-state": state,
      "data-side": side,
      "data-collapsed-state": collapsedState,
      "data-target-state": nextState,
      ...(disabled ? { "data-disabled": "" } : {}),
      "aria-controls": panelId,
      "aria-expanded": state === "expanded",
      "aria-disabled": disabled || undefined,
      disabled: disabled || undefined,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
