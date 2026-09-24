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

export interface NavigationMenuViewportPositionOptions {
  triggerRect: NavigationMenuRect;
  rootRect: NavigationMenuRect;
  viewportWidth: number;
  boundaryRect: Pick<NavigationMenuRect, "left" | "width"> & Partial<Pick<NavigationMenuRect, "top" | "height">>;
  collisionPadding?: number;
  align?: "center" | "start" | "end";
  dir?: "ltr" | "rtl";
  orientation?: "horizontal" | "vertical";
  viewportHeight?: number;
}

export interface NavigationMenuViewportPosition {
  left: number;
  availableWidth: number;
  top?: number;
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

export function getNavigationMenuViewportPosition({
  triggerRect,
  rootRect,
  viewportWidth,
  boundaryRect,
  collisionPadding = 8,
  align = "center",
  dir = "ltr",
  orientation = "horizontal",
  viewportHeight = 0,
}: NavigationMenuViewportPositionOptions): NavigationMenuViewportPosition {
  const padding = Math.max(0, collisionPadding);
  const boundaryStart = boundaryRect.left + padding;
  const boundaryEnd = boundaryRect.left + boundaryRect.width - padding;
  const availableWidth = Math.max(0, boundaryEnd - boundaryStart);
  const resolvedWidth = Math.min(Math.max(0, viewportWidth), availableWidth);
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const start = dir === "rtl" ? triggerRect.left + triggerRect.width - resolvedWidth : triggerRect.left;
  const end = dir === "rtl" ? triggerRect.left : triggerRect.left + triggerRect.width - resolvedWidth;
  const preferredLeft = align === "start" ? start : align === "end" ? end : triggerCenter - resolvedWidth / 2;
  const maximumLeft = Math.max(boundaryStart, boundaryEnd - resolvedWidth);
  const absoluteLeft = Math.min(
    Math.max(preferredLeft, boundaryStart),
    maximumLeft,
  );
  const preferredTop = triggerRect.top + (align === "start" ? 0 : align === "end" ? triggerRect.height - viewportHeight : (triggerRect.height - viewportHeight) / 2);
  const topStart = (boundaryRect.top ?? 0) + padding;
  const topEnd = boundaryRect.height === undefined ? Infinity : (boundaryRect.top ?? 0) + boundaryRect.height - padding - viewportHeight;
  const absoluteTop = Math.min(Math.max(preferredTop, topStart), Math.max(topStart, topEnd));

  return {
    left: absoluteLeft - rootRect.left,
    availableWidth,
    ...(orientation === "vertical" ? {
      top: absoluteTop - rootRect.top,
    } : {}),
  };
}

export function getNavigationMenuViewportPositionStyle(
  position: NavigationMenuViewportPosition,
): NavigationMenuGeometryStyle {
  return {
    "--atom-navigation-menu-viewport-left": `${position.left}px`,
    "--atom-navigation-menu-viewport-available-width": `${position.availableWidth}px`,
    ...(position.top !== undefined ? { "--atom-navigation-menu-viewport-top": `${position.top}px` } : {}),
  };
}
