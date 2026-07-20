"use client";

import { forwardRef, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { NativeHeadingProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { usePopoverContext } from "./context.js";
import { markPopoverPart } from "./parts.js";

export type PopoverHeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type PopoverTitleNativeProps = NativeHeadingProps<"children">;

export interface PopoverTitleProps extends PopoverTitleNativeProps {
  children: ReactNode;
  as?: PopoverHeadingLevel;
  className?: string;
  "data-slot"?: string;
}

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  function PopoverTitle(
    {
      children,
      as: Tag = "h2",
      className,
      "data-slot": dataSlot = "popover-title",
      ...restProps
    },
    ref,
  ) {
    const { titleId, registerPart } = usePopoverContext();
    const unregisterRef = useRef<(() => void) | null>(null);
    const registrationRef = useCallback(
      (node: HTMLHeadingElement | null) => {
        unregisterRef.current?.();
        unregisterRef.current = node ? registerPart("title") : null;
      },
      [registerPart],
    );
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [registrationRef, ref],
    );

    return (
      <Tag
        {...restProps}
        ref={composedRef}
        id={titleId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </Tag>
    );
  },
);

markPopoverPart(PopoverTitle, "title");
