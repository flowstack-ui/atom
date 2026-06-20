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
import { useHoverCardContentContext } from "./context.js";
import type { HoverCardSide } from "./HoverCardContent.js";

type HoverCardArrowNativeProps = Omit<SVGProps<SVGSVGElement>, "children">;

export interface HoverCardArrowProps extends HoverCardArrowNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  height?: number;
  render?: RenderProp;
  width?: number;
  "data-slot"?: string;
}

export type HoverCardArrowGeometry = FloatingArrowGeometry;

export function getHoverCardArrowGeometry(
  side: HoverCardSide,
  width: number,
  height: number,
): HoverCardArrowGeometry {
  return getFloatingArrowGeometry(side, width, height);
}

export const HoverCardArrow = forwardRef<SVGSVGElement, HoverCardArrowProps>(
function HoverCardArrow(
  {
    children,
    asChild = false,
    height = 5,
    render,
    width = 10,
    "data-slot": dataSlot = "hover-card-arrow",
    style,
    viewBox,
    ...restProps
  },
  ref,
) {
  const { arrowRef, side, arrowX, arrowY } = useHoverCardContentContext();

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
