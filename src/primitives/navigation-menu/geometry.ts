import type { CSSProperties } from "react";

export interface NavigationMenuRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface NavigationMenuGeometryOptions {
  triggerRect: NavigationMenuRect;
  rootRect: NavigationMenuRect;
}

export interface NavigationMenuGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export type NavigationMenuGeometryStyle = CSSProperties & {
  [key: `--${string}`]: string;
};

export function getNavigationMenuGeometry({
  triggerRect,
  rootRect,
}: NavigationMenuGeometryOptions): NavigationMenuGeometry {
  const left = triggerRect.left - rootRect.left;
  const top = triggerRect.top - rootRect.top;

  return {
    left,
    top,
    width: triggerRect.width,
    height: triggerRect.height,
    centerX: left + triggerRect.width / 2,
    centerY: top + triggerRect.height / 2,
  };
}

export function getNavigationMenuGeometryStyle(
  geometry: NavigationMenuGeometry,
): NavigationMenuGeometryStyle {
  return {
    "--atom-navigation-menu-trigger-left": `${geometry.left}px`,
    "--atom-navigation-menu-trigger-top": `${geometry.top}px`,
    "--atom-navigation-menu-trigger-width": `${geometry.width}px`,
    "--atom-navigation-menu-trigger-height": `${geometry.height}px`,
    "--atom-navigation-menu-trigger-center-x": `${geometry.centerX}px`,
    "--atom-navigation-menu-trigger-center-y": `${geometry.centerY}px`,
  };
}

export function getNavigationMenuViewportSizeStyle(
  width: number,
  height: number,
): NavigationMenuGeometryStyle {
  return {
    "--atom-navigation-menu-viewport-width": `${width}px`,
    "--atom-navigation-menu-viewport-height": `${height}px`,
  };
}
