"use client";

import { forwardRef } from "react";
import { ButtonRoot, type ButtonRootProps } from "../button/index.js";
import { useSelectContext } from "./context.js";

export type SelectClearTriggerProps = Omit<ButtonRootProps, "href" | "target" | "rel" | "loading">;

/** Render beside Trigger, never inside its button. Supply a localized name. */
export const SelectClearTrigger = forwardRef<HTMLButtonElement, SelectClearTriggerProps>(
  function SelectClearTrigger({ onPress, disabled, ...props }, ref) {
    const ctx = useSelectContext();
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
