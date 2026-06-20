"use client";

import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from "react";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "./slot.js";

export type { RenderProp } from "./slot.js";

export type FloatingArrowSide = "top" | "right" | "bottom" | "left";

export interface FloatingArrowGeometry {
  svgHeight: number;
  svgWidth: number;
  outwardSize: number;
  points: string;
}

const staticSideByPlacement: Record<
  FloatingArrowSide,
  "top" | "right" | "bottom" | "left"
> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

export function getFloatingArrowGeometry(
  side: FloatingArrowSide,
  width: number,
  height: number,
): FloatingArrowGeometry {
  if (side === "left") {
    return {
      svgHeight: width,
      svgWidth: height,
      outwardSize: height,
      points: `0,0 ${height},${width / 2} 0,${width}`,
    };
  }

  if (side === "right") {
    return {
      svgHeight: width,
      svgWidth: height,
      outwardSize: height,
      points: `${height},0 0,${width / 2} ${height},${width}`,
    };
  }

  if (side === "bottom") {
    return {
      svgHeight: height,
      svgWidth: width,
      outwardSize: height,
      points: `0,${height} ${width / 2},0 ${width},${height}`,
    };
  }

  return {
    svgHeight: height,
    svgWidth: width,
    outwardSize: height,
    points: `0,0 ${width / 2},${height} ${width},0`,
  };
}

type FloatingArrowNativeProps = Omit<SVGProps<SVGSVGElement>, "children">;

export interface FloatingArrowProps extends FloatingArrowNativeProps {
  arrowRef: RefObject<SVGSVGElement | null>;
  children?: ReactNode;
  asChild?: boolean;
  dataSlot: string;
  height?: number;
  render?: RenderProp;
  side: FloatingArrowSide;
  width?: number;
  arrowX?: number;
  arrowY?: number;
}

export const FloatingArrow = forwardRef<SVGSVGElement, FloatingArrowProps>(
  function FloatingArrow(
    {
      arrowRef,
      arrowX,
      arrowY,
      asChild = false,
      children,
      dataSlot,
      height = 5,
      render,
      side,
      style,
      viewBox,
      width = 10,
      ...restProps
    },
    ref,
  ) {
    const geometry = getFloatingArrowGeometry(side, width, height);
    const composedRef = useMemo(
      () => composeRefs(arrowRef, ref),
      [arrowRef, ref],
    );
    const staticSide = staticSideByPlacement[side];
    const positionStyle: CSSProperties = {
      position: "absolute",
      left: arrowX === undefined ? undefined : `${arrowX}px`,
      top: arrowY === undefined ? undefined : `${arrowY}px`,
      right: "",
      bottom: "",
      [staticSide]: `-${geometry.outwardSize}px`,
    };

    const arrowProps = {
      ...restProps,
      ref: composedRef,
      "aria-hidden": true,
      "data-slot": dataSlot,
      "data-side": side,
      height: geometry.svgHeight,
      style: {
        ...style,
        ...positionStyle,
      },
      viewBox: viewBox ?? `0 0 ${geometry.svgWidth} ${geometry.svgHeight}`,
      width: geometry.svgWidth,
    };

    if (asChild) {
      return cloneAndMerge(children, arrowProps);
    }

    return renderElement(render, "svg", {
      ...arrowProps,
      children: children ?? <polygon points={geometry.points} />,
    });
  },
);
