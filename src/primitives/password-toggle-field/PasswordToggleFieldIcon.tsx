"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { usePasswordToggleFieldContext } from "./context.js";

type PasswordToggleFieldIconNativeProps = NativeSpanProps<"children" | "hidden">;

export interface PasswordToggleFieldIconProps
  extends PasswordToggleFieldIconNativeProps {
  visible: ReactNode;
  hidden: ReactNode;
  "data-slot"?: string;
}

export const PasswordToggleFieldIcon = forwardRef<
  HTMLSpanElement,
  PasswordToggleFieldIconProps
>(function PasswordToggleFieldIcon(
  {
    visible,
    hidden,
    "data-slot": dataSlot = "password-toggle-field-icon",
    ...restProps
  },
  ref,
) {
  const ctx = usePasswordToggleFieldContext();

  return (
    <span
      {...restProps}
      ref={ref}
      aria-hidden="true"
      data-slot={dataSlot}
      data-state={ctx.visible ? "visible" : "hidden"}
    >
      {ctx.visible ? visible : hidden}
    </span>
  );
});
