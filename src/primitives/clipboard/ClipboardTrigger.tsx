"use client";

import { forwardRef, type KeyboardEventHandler, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext } from "./context.js";

type ClipboardTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface ClipboardTriggerProps extends ClipboardTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardTrigger = forwardRef<HTMLButtonElement, ClipboardTriggerProps>(
  function ClipboardTrigger(
    { children, disabled, render, asChild, onClick, onKeyDown, "data-slot": dataSlot = "clipboard-trigger", ...restProps },
    ref,
  ) {
    const context = useClipboardContext();
    const isDisabled = disabled ?? context.disabled;
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild ? childHasNativeButtonSemantics(children) : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));
    const activate = () => {
      if (!isDisabled) void context.copy();
    };
    const handleClick: MouseEventHandler<HTMLButtonElement> = activate;
    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (hasNativeSemantics || (event.key !== " " && event.key !== "Enter")) return;
      event.preventDefault();
      activate();
    };
    const props: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isNativeButton ? { type: "button", disabled: isDisabled || undefined } : {}),
      ...(!hasNativeSemantics && { role: "button", tabIndex: isDisabled ? undefined : 0 }),
      ...(!isNativeButton && { "aria-disabled": isDisabled || undefined }),
      "data-slot": dataSlot,
      "data-state": context.status,
      ...(isDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "button", { ...props, children });
  },
);
