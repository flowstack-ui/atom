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

type DropdownMenuTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type" | "value">;

export interface DropdownMenuTriggerProps extends DropdownMenuTriggerNativeProps {
  value?: string;
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
      value = "default",
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
    const register = useCallback((node: HTMLElement | null) => { if (ctx.registerTrigger) ctx.registerTrigger(value, node); else ctx.triggerRef.current = node; }, [ctx.registerTrigger, ctx.triggerRef, value]);
    const composedRef = useMemo(() => composeRefs(register, ref), [register, ref]);

    const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
      if (disabled) return;
      const changing = ctx.triggerValue !== undefined && ctx.triggerValue !== value;
      ctx.activateTrigger?.(value, event.currentTarget);
      ctx.onInitialHighlight(event.detail === 0 ? "first" : null);
      if (ctx.isOpen && changing) ctx.onOpen(); else ctx.onToggle();
    }, [ctx, disabled, value]);

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
      (event) => {
        if (disabled) return;
        ctx.activateTrigger?.(value, event.currentTarget);

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
      [ctx, disabled, value],
    );

    const triggerProps = {
      ...restProps,
      ref: composedRef,
      id: ctx.triggerId.replace(/-trigger(?:-.*)?$/, `-trigger-${value}`),
      role: asChild || render ? "button" : undefined,
      tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
      type: !asChild && !render ? "button" : undefined,
      disabled: !asChild && !render ? disabled || undefined : undefined,
      "data-slot": dataSlot,
      "data-state": ctx.isOpen && (ctx.triggerValue === undefined || ctx.triggerValue === value) ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      "aria-haspopup": "menu",
      "aria-expanded": ctx.isOpen && (ctx.triggerValue === undefined || ctx.triggerValue === value),
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
