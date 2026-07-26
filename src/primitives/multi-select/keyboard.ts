"use client";

import { getTypeaheadMatch } from "../../utils/typeahead.js";
import type { MultiSelectContextValue } from "./context.js";

export function getInitialMultiSelectHighlight(ctx: MultiSelectContextValue): string | null {
  const values = ctx.getEnabledItemValues();
  if (values.length === 0) return null;
  const firstSelected = ctx.value.find((value) => values.includes(value));
  if (firstSelected) return firstSelected;
  return values[0];
}

export function getNextMultiSelectHighlight(
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

export function getMultiSelectTypeaheadMatch(
  ctx: MultiSelectContextValue,
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
