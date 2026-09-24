"use client";

import { getTypeaheadMatch } from "../../utils/typeahead.js";
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
  loop = true,
): string | null {
  if (values.length === 0) return null;

  const currentIndex = currentValue ? values.indexOf(currentValue) : -1;
  if (!loop && currentIndex >= 0) {
    const nextIndex = Math.max(0, Math.min(values.length - 1, currentIndex + (direction === "next" ? 1 : -1)));
    return values[nextIndex];
  }

  if (direction === "next") {
    return values[currentIndex < values.length - 1 ? currentIndex + 1 : 0];
  }

  return values[currentIndex > 0 ? currentIndex - 1 : values.length - 1];
}

export function getSelectTypeaheadMatch(
  ctx: SelectContextValue,
  buffer: string,
  currentValue: string | null,
): string | null {
  return getTypeaheadMatch(
    ctx.getEnabledItemValues().map((value) => ({
      value,
      label: ctx.getLabel(value) ?? value,
    })),
    buffer,
    currentValue,
  );
}
