"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

export interface ComboboxTriggerProps
  extends NativeButtonProps<"children" | "disabled" | "type"> {
  children?: ReactNode;
  "data-slot"?: string;
}

export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  function ComboboxTrigger(
    {
      children,
      "data-slot": dataSlot = "combobox-trigger",
      onClick,
      onMouseDown,
      ...props
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const { inputRef, onToggle } = ctx;
    const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback(
      (event) => event.preventDefault(),
      [],
    );
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
      onToggle();
      inputRef.current?.focus({ preventScroll: true });
    }, [inputRef, onToggle]);

    return (
      <button
        {...props}
        aria-controls={ctx.listboxId}
        aria-expanded={ctx.isOpen}
        aria-haspopup="listbox"
        data-slot={dataSlot}
        data-state={ctx.isOpen ? "open" : "closed"}
        data-invalid={ctx.invalid ? "" : undefined}
        disabled={ctx.disabled || ctx.readOnly || undefined}
        onClick={composeEventHandlers(onClick, handleClick)}
        onMouseDown={composeEventHandlers(onMouseDown, handleMouseDown)}
        ref={ref}
        type="button"
      >
        {children}
      </button>
    );
  },
);
