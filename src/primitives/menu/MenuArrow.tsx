"use client";

import { forwardRef, type ReactNode, type SVGProps } from "react";
import { FloatingArrow, type RenderProp } from "../../utils/floatingArrow.js";
import { useMenuContentContext } from "./context.js";

type MenuArrowNativeProps = Omit<SVGProps<SVGSVGElement>, "children">;
export interface MenuArrowProps extends MenuArrowNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  width?: number;
  height?: number;
  render?: RenderProp;
  "data-slot"?: string;
}

export const MenuArrow = forwardRef<SVGSVGElement, MenuArrowProps>(function MenuArrow(
  { children, asChild = false, width = 10, height = 5, render, "data-slot": dataSlot = "menu-arrow", style, viewBox, ...restProps },
  ref,
) {
  const { arrowRef, arrowX, arrowY, side } = useMenuContentContext();
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
    >{children}</FloatingArrow>
  );
});
