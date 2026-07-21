import { size, type Middleware, type Placement } from "@floating-ui/react";
import type { DirectionValue } from "../primitives/direction/index.js";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlign = "start" | "center" | "end";

export function resolveFloatingDirection(
  explicitDir: string | undefined,
  reference: HTMLElement | null,
  contextDir: DirectionValue,
): DirectionValue {
  if (explicitDir === "ltr" || explicitDir === "rtl") return explicitDir;
  if (reference && typeof window !== "undefined") {
    return window.getComputedStyle(reference).direction === "rtl" ? "rtl" : "ltr";
  }
  return contextDir;
}

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

export function getFloatingAvailableSizeMiddleware(): Middleware {
  return size({
    padding: 8,
    apply({ availableHeight, availableWidth, elements }) {
      elements.floating.style.setProperty(
        "--atom-floating-available-height",
        `${Math.max(0, availableHeight)}px`,
      );
      elements.floating.style.setProperty(
        "--atom-floating-available-width",
        `${Math.max(0, availableWidth)}px`,
      );
    },
  });
}
