export interface FloatingPanelPoint { x: number; y: number }
export interface FloatingPanelSize { width: number; height: number }
export interface PanelRect extends FloatingPanelPoint, FloatingPanelSize {}
export type FloatingPanelAxis = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export type FloatingPanelStage = "default" | "minimized" | "maximized";
export interface RectConstraints { min?: FloatingPanelSize; max?: FloatingPanelSize; boundary?: PanelRect; contain?: boolean }
export function validatePoint(point: FloatingPanelPoint) {
  if (![point.x, point.y].every(Number.isFinite)) throw new Error("FloatingPanel position must be finite.");
}
export function validateSize(size: FloatingPanelSize) {
  if (![size.width, size.height].every(n => Number.isFinite(n) && n > 0)) throw new Error("FloatingPanel dimensions must be positive finite CSS pixels.");
}
export function constrainRect(rect: PanelRect, { min, max, boundary, contain }: RectConstraints): PanelRect {
  validatePoint(rect); validateSize(rect);
  if (min) validateSize(min);
  if (max) validateSize(max);
  if (min && max && (min.width > max.width || min.height > max.height)) throw new Error("FloatingPanel minSize exceeds maxSize.");
  const limitW = Math.min(max?.width ?? Infinity, contain && boundary ? boundary.width : Infinity);
  const limitH = Math.min(max?.height ?? Infinity, contain && boundary ? boundary.height : Infinity);
  const width = Math.min(limitW, Math.max(Math.min(min?.width ?? 1, limitW), rect.width));
  const height = Math.min(limitH, Math.max(Math.min(min?.height ?? 1, limitH), rect.height));
  return { width, height,
    x: contain && boundary ? Math.max(boundary.x, Math.min(boundary.x + boundary.width - width, rect.x)) : rect.x,
    y: contain && boundary ? Math.max(boundary.y, Math.min(boundary.y + boundary.height - height, rect.y)) : rect.y };
}
export function resizeRect(start: PanelRect, delta: FloatingPanelPoint, axis: FloatingPanelAxis,
  constraints: RectConstraints, ratio = false, center = false): PanelRect {
  const west = axis.includes("w"), east = axis.includes("e"), north = axis.includes("n"), south = axis.includes("s");
  const factor = center ? 2 : 1;
  let width = Math.max(1, start.width + (west ? -delta.x : east ? delta.x : 0) * factor);
  let height = Math.max(1, start.height + (north ? -delta.y : south ? delta.y : 0) * factor);
  const aspect = start.width / start.height;
  if (ratio) {
    if (!(west || east) || ((north || south) && Math.abs(height / start.height - 1) > Math.abs(width / start.width - 1))) width = height * aspect;
    else height = width / aspect;
    const b = constraints.contain ? constraints.boundary : undefined;
    const maxW = Math.min(constraints.max?.width ?? Infinity, (constraints.max?.height ?? Infinity) * aspect,
      b ? b.width : Infinity, b ? b.height * aspect : Infinity);
    const minW = Math.min(maxW, Math.max(constraints.min?.width ?? 1, (constraints.min?.height ?? 1) * aspect));
    width = Math.min(maxW, Math.max(minW, width)); height = width / aspect;
  } else {
    const sized = constrainRect({ ...start, width, height }, constraints);
    width = sized.width; height = sized.height;
  }
  const x = center ? start.x + (start.width - width) / 2 : west ? start.x + start.width - width : start.x;
  const y = center ? start.y + (start.height - height) / 2 : north ? start.y + start.height - height : start.y;
  // Anchored edges determine available room; limit expansion before clamping
  // position so a bounded west/north resize does not move its opposite edge.
  const b = constraints.contain ? constraints.boundary : undefined;
  if (b) {
    const availW = center ? 2 * Math.min(start.x + start.width / 2 - b.x, b.x + b.width - start.x - start.width / 2)
      : west ? start.x + start.width - b.x : b.x + b.width - start.x;
    const availH = center ? 2 * Math.min(start.y + start.height / 2 - b.y, b.y + b.height - start.y - start.height / 2)
      : north ? start.y + start.height - b.y : b.y + b.height - start.y;
    if (ratio) { width = Math.min(width, Math.max(1, availW), Math.max(1, availH) * aspect); height = width / aspect; }
    else { width = Math.min(width, Math.max(1, availW)); height = Math.min(height, Math.max(1, availH)); }
    return { width, height,
      x: center ? start.x + (start.width - width) / 2 : west ? start.x + start.width - width : start.x,
      y: center ? start.y + (start.height - height) / 2 : north ? start.y + start.height - height : start.y };
  }
  return { x, y, width, height };
}
