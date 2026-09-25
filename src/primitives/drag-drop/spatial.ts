"use client";

import { createContext, useContext } from "react";

/** Private collection layout seam; generic DragDrop retains its existing API. */
export const SpatialLayoutContext = createContext<"linear" | "grid">("linear");
SpatialLayoutContext.displayName = "SpatialLayoutContext";
export const useSpatialLayout = () => useContext(SpatialLayoutContext);

export interface SpatialRect { left: number; top: number; width: number; height: number }
/** Row distance wins over inline distance, including inter-row gaps. */
export function spatialDistance(rect: SpatialRect, point: { x: number; y: number }) {
  const block = Math.max(rect.top - point.y, point.y - rect.top - rect.height, 0);
  const inline = Math.max(rect.left - point.x, point.x - rect.left - rect.width, 0);
  return [block, inline, Math.abs(point.x - rect.left - rect.width / 2)];
}
export function compareDistance(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i]! - b[i]!) > 0.5) return a[i]! - b[i]!;
  return 0;
}
