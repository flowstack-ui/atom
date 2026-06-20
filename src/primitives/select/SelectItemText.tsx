"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useSelectItemContext } from "./context.js";

type SelectItemTextNativeProps = NativeSpanProps<"children">;

export interface SelectItemTextProps extends SelectItemTextNativeProps {
  children: ReactNode;
  className?: string;
}

export const SelectItemText = forwardRef<HTMLSpanElement, SelectItemTextProps>(
  function SelectItemText({ children, className, ...restProps }, ref) {
    const ctx = useSelectItemContext();
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
        data-slot="select-item-text"
        className={className}
      >
        {children}
      </span>
    );
  },
);
