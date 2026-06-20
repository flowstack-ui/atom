"use client";

import {
  forwardRef,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  FloatingArrow,
  getFloatingArrowGeometry,
  type FloatingArrowGeometry,
  type RenderProp,
} from "../../utils/floatingArrow.js";
import { useTooltipContentContext } from "./context.js";
import type { TooltipSide } from "./TooltipContent.js";

type TooltipArrowNativeProps = Omit<SVGProps<SVGSVGElement>, "children">;

export interface TooltipArrowProps extends TooltipArrowNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  height?: number;
  render?: RenderProp;
  width?: number;
  "data-slot"?: string;
}

export type TooltipArrowGeometry = FloatingArrowGeometry;

export function getTooltipArrowGeometry(
  side: TooltipSide,
  width: number,
  height: number,
): TooltipArrowGeometry {
  return getFloatingArrowGeometry(side, width, height);
}

export const TooltipArrow = forwardRef<SVGSVGElement, TooltipArrowProps>(
function TooltipArrow(
  {
    children,
    asChild = false,
    height = 5,
    render,
    width = 10,
    "data-slot": dataSlot = "tooltip-arrow",
    style,
    viewBox,
    ...restProps
  },
  ref,
) {
  const { arrowRef, side, arrowX, arrowY } = useTooltipContentContext();

  return (
    <FloatingArrow
      {...restProps}
      ref={ref}
      arrowRef={arrowRef}
      arrowX={arrowX}
      arrowY={arrowY}
      asChild={asChild}
      dataSlot={dataSlot}
      height={height}
      render={render}
      side={side}
      style={style}
      viewBox={viewBox}
      width={width}
    >
      {children}
    </FloatingArrow>
  );
});
