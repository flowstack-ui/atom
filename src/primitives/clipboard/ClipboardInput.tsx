"use client";

import { forwardRef, type ChangeEventHandler } from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { useClipboardContext } from "./context.js";

type ClipboardInputNativeProps = NativeInputProps<"defaultValue" | "disabled" | "value">;

export interface ClipboardInputProps extends ClipboardInputNativeProps {
  disabled?: boolean;
  "data-slot"?: string;
}

export const ClipboardInput = forwardRef<HTMLInputElement, ClipboardInputProps>(
  function ClipboardInput(
    { id, disabled, onChange, "data-slot": dataSlot = "clipboard-input", ...restProps },
    ref,
  ) {
    const context = useClipboardContext();
    const isDisabled = disabled ?? context.disabled;
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      context.setValue(event.currentTarget.value);
    };
    return (
      <input
        {...restProps}
        ref={ref}
        id={id ?? context.inputId}
        value={context.value}
        disabled={isDisabled || undefined}
        onChange={composeEventHandlers(onChange, handleChange)}
        data-slot={dataSlot}
        data-state={context.status}
        data-disabled={isDisabled ? "" : undefined}
      />
    );
  },
);
