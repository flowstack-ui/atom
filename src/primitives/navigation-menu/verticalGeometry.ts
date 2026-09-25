import type { NavigationMenuRect } from "./geometry.js";

/** Keep the panel connected to a physical side, flipping only for more room. */
export function getVerticalNavigationGeometry(root: NavigationMenuRect, boundary: Pick<NavigationMenuRect, "left" | "width">, width: number, dir: "ltr" | "rtl", padding: number, gap: number) {
  const start = boundary.left + padding;
  const end = boundary.left + boundary.width - padding;
  const leftRoom = Math.max(0, root.left - gap - start);
  const rightRoom = Math.max(0, end - root.left - root.width - gap);
  const preferred = dir === "rtl" ? "left" : "right";
  const preferredRoom = preferred === "left" ? leftRoom : rightRoom;
  const otherRoom = preferred === "left" ? rightRoom : leftRoom;
  const side = width > preferredRoom && otherRoom > preferredRoom ? (preferred === "left" ? "right" : "left") : preferred;
  const availableWidth = side === "left" ? leftRoom : rightRoom;
  const resolvedWidth = Math.min(width, availableWidth);
  return { side, availableWidth, left: side === "left" ? -gap - resolvedWidth : root.width + gap } as const;
}
