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
import { usePopoverContentContext } from "./context.js";
import type { PopoverSide } from "./PopoverContent.js";

type PopoverArrowNativeProps = Omit<SVGProps<SVGSVGElement>, "children">;

export interface PopoverArrowProps extends PopoverArrowNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  height?: number;
  render?: RenderProp;
  width?: number;
  "data-slot"?: string;
}

export type PopoverArrowGeometry = FloatingArrowGeometry;

export function getPopoverArrowGeometry(
  side: PopoverSide,
  width: number,
  height: number,
): PopoverArrowGeometry {
  return getFloatingArrowGeometry(side, width, height);
}

export const PopoverArrow = forwardRef<SVGSVGElement, PopoverArrowProps>(
function PopoverArrow(
  {
    children,
    asChild = false,
    height = 5,
    render,
    width = 10,
    "data-slot": dataSlot = "popover-arrow",
    style,
    viewBox,
    ...restProps
  },
  ref,
) {
  const { arrowRef, side, arrowX, arrowY } = usePopoverContentContext();

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
