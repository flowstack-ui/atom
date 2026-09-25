"use client";

import { forwardRef } from "react";
import { ButtonRoot, type ButtonRootProps } from "../button/index.js";
import { useMultiSelectContext } from "./context.js";

export type MultiSelectClearTriggerProps = Omit<ButtonRootProps, "href" | "target" | "rel" | "loading">;

/** Render beside Trigger, never inside its button. Supply a localized name. */
export const MultiSelectClearTrigger = forwardRef<HTMLButtonElement, MultiSelectClearTriggerProps>(
  function MultiSelectClearTrigger({ onPress, disabled, ...props }, ref) {
    const ctx = useMultiSelectContext();
    return (
      <ButtonRoot
        {...props}
        ref={ref}
        disabled={disabled || ctx.disabled || ctx.readOnly}
        onPress={(event) => {
          onPress?.(event);
          if (event.defaultPrevented) return;
          ctx.clearValue();
          ctx.onClose();
          ctx.triggerRef.current?.focus({ preventScroll: true });
        }}
      />
    );
  },
);
