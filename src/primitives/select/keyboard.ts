"use client";

import type { SelectContextValue } from "./context.js";

export function getInitialSelectHighlight(ctx: SelectContextValue): string | null {
  const values = ctx.getEnabledItemValues();
  if (values.length === 0) return null;
  if (ctx.value && values.includes(ctx.value)) return ctx.value;
  return values[0];
}

export function getNextSelectHighlight(
  values: string[],
  currentValue: string | null,
  direction: "next" | "previous",
): string | null {
  if (values.length === 0) return null;

  const currentIndex = currentValue ? values.indexOf(currentValue) : -1;

  if (direction === "next") {
    return values[currentIndex < values.length - 1 ? currentIndex + 1 : 0];
  }

  return values[currentIndex > 0 ? currentIndex - 1 : values.length - 1];
}

export function getSelectTypeaheadMatch(
  ctx: SelectContextValue,
  buffer: string,
): string | null {
  const normalizedBuffer = buffer.toLowerCase();

  return (
    ctx.getEnabledItemValues().find((value) => {
      const label = ctx.getLabel(value) ?? value;
      return label.toLowerCase().startsWith(normalizedBuffer);
    }) ?? null
  );
}
