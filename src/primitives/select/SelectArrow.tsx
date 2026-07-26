"use client";

import { forwardRef, useMemo, type CSSProperties } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useSelectContentContext } from "./context.js";

type SelectArrowNativeProps = NativeSpanProps<"children">;

export interface SelectArrowProps extends SelectArrowNativeProps {
  className?: string;
  "data-slot"?: string;
}

export const SelectArrow = forwardRef<HTMLSpanElement, SelectArrowProps>(
  function SelectArrow({ className, style, "data-slot": dataSlot = "select-arrow", ...restProps }, ref) {
    const { align, arrowRef, arrowX, arrowY, side } = useSelectContentContext();
    const composedRef = useMemo(() => composeRefs(arrowRef, ref), [arrowRef, ref]);
    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[side] as "top" | "right" | "bottom" | "left";
    const positionStyle: CSSProperties = {
      position: "absolute",
      left: arrowX === undefined ? undefined : `${arrowX}px`,
      top: arrowY === undefined ? undefined : `${arrowY}px`,
      right: "",
      bottom: "",
      [staticSide]: 0,
    };

    return (
      <span
        {...restProps}
        ref={composedRef}
        aria-hidden="true"
        data-slot={dataSlot}
        data-side={side}
        data-align={align}
        className={className}
        style={{ ...style, ...positionStyle }}
      />
    );
  },
);
