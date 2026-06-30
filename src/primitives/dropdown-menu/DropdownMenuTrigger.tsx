"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";

type DropdownMenuTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface DropdownMenuTriggerProps extends DropdownMenuTriggerNativeProps {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(
    {
      children,
      disabled = false,
      className,
      asChild = false,
      render,
      "data-slot": dataSlot = "dropdown-menu-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const ctx = useMenuContext();
    const composedRef = useMemo(() => composeRefs(ctx.triggerRef, ref), [ctx.triggerRef, ref]);

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
      if (disabled) return;
      ctx.onInitialHighlight(null);
      ctx.onToggle();
    }, [ctx, disabled]);

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
      (event) => {
        if (disabled) return;

        if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
          event.preventDefault();
          ctx.onInitialHighlight("first");
          ctx.onOpen();
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          ctx.onInitialHighlight("last");
          ctx.onOpen();
        }
      },
      [ctx, disabled],
    );

    const triggerProps = {
      ...restProps,
      ref: composedRef,
      id: ctx.triggerId,
      role: asChild || render ? "button" : undefined,
      tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
      type: !asChild && !render ? "button" : undefined,
      disabled: !asChild && !render ? disabled || undefined : undefined,
      "data-slot": dataSlot,
      "data-state": ctx.isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      "aria-haspopup": "menu",
      "aria-expanded": ctx.isOpen,
      "aria-controls": ctx.menuId,
      "aria-disabled": disabled || undefined,
      onClick: composeEventHandlers(onClick as MouseEventHandler<HTMLElement> | undefined, handleClick),
      onKeyDown: composeEventHandlers(
        onKeyDown as KeyboardEventHandler<HTMLElement> | undefined,
        handleKeyDown,
      ),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, triggerProps);
    }

    return renderElement(render, "button", { ...triggerProps, children });
  },
);
