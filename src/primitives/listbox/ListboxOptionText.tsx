"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useListboxOptionContext } from "./context.js";

type ListboxOptionTextNativeProps = NativeSpanProps<"children" | "id">;

export interface ListboxOptionTextProps extends ListboxOptionTextNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ListboxOptionText = forwardRef<HTMLElement, ListboxOptionTextProps>(
  function ListboxOptionText(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "listbox-option-text",
      ...restProps
    },
    ref,
  ) {
    const { registerText, textId, value } = useListboxOptionContext();
    const internalRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);

    useEffect(() => {
      const textContent = internalRef.current?.textContent?.trim();
      const textValue = textContent || (typeof children === "string" ? children : value);
      registerText(textValue);
    }, [children, registerText, value]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: textId,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
