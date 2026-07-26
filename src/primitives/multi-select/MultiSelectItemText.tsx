"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useMultiSelectItemContext } from "./context.js";

type MultiSelectItemTextNativeProps = NativeSpanProps<"children">;

export interface MultiSelectItemTextProps extends MultiSelectItemTextNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectItemText = forwardRef<HTMLSpanElement, MultiSelectItemTextProps>(
  function MultiSelectItemText({ children, className, "data-slot": dataSlot = "multi-select-item-text", ...restProps }, ref) {
    const ctx = useMultiSelectItemContext();
    const internalRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const textValue = internalRef.current?.textContent?.trim();
      if (textValue) ctx.registerText(textValue);
    }, [children, ctx.registerText]);

    return (
      <span
        {...restProps}
        ref={composeRefs(internalRef, ref)}
        id={ctx.textId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </span>
    );
  },
);
