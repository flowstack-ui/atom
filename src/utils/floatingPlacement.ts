import type { Placement } from "@floating-ui/react";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlign = "start" | "center" | "end";

const oppositeSide: Record<FloatingSide, FloatingSide> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

const perpendicularSides: Record<FloatingSide, readonly [FloatingSide, FloatingSide]> = {
  top: ["right", "left"],
  right: ["bottom", "top"],
  bottom: ["right", "left"],
  left: ["bottom", "top"],
};

function toPlacement(side: FloatingSide, align: FloatingAlign): Placement {
  return align === "center" ? side : `${side}-${align}`;
}

function fallbackAlignments(align: FloatingAlign): FloatingAlign[] {
  if (align === "start") return ["center", "end"];
  if (align === "end") return ["center", "start"];
  return ["start", "end"];
}

function placementsForSide(side: FloatingSide, align: FloatingAlign): Placement[] {
  return [align, ...fallbackAlignments(align)].map((candidate) =>
    toPlacement(side, candidate),
  );
}

export function getFloatingFallbackPlacements(
  side: FloatingSide,
  align: FloatingAlign,
): Placement[] {
  const sameSideAlternates = fallbackAlignments(align).map((candidate) =>
    toPlacement(side, candidate),
  );
  const opposite = placementsForSide(oppositeSide[side], align);
  const perpendicular = perpendicularSides[side].flatMap((candidate) =>
    placementsForSide(candidate, align),
  );

  return [...sameSideAlternates, ...opposite, ...perpendicular];
}
