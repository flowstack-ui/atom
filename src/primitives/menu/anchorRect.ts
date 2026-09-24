/** DOMRect fields are prototype getters, so object spread does not preserve them. */
export function normalizeMenuAnchorRect(rect: { x: number; y: number; width: number; height: number } | null | undefined) {
  const { x = 0, y = 0, width = 0, height = 0 } = rect ?? {};
  return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height };
}
