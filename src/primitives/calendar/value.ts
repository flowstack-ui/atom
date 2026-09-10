import { toCalendar, type DateValue } from "@internationalized/date";

export type DateSelectionMode = "single" | "range" | "multiple";
export interface DateRangeValue { start: DateValue | null; end: DateValue | null }
export type DateSelectionValue = DateValue | DateRangeValue | DateValue[] | null;
export type DateSelectionProps =
  | { selectionMode?: "single"; value?: DateValue | null; defaultValue?: DateValue | null; onValueChange?: (value: DateValue | null) => void }
  | { selectionMode: "range"; value?: DateRangeValue; defaultValue?: DateRangeValue; onValueChange?: (value: DateRangeValue) => void }
  | { selectionMode: "multiple"; value?: DateValue[]; defaultValue?: DateValue[]; onValueChange?: (value: DateValue[]) => void };

export function selectionArray(mode: DateSelectionMode, value: DateSelectionValue | undefined): DateValue[] {
  if (value == null) return [];
  if (mode === "multiple") {
    if (!Array.isArray(value)) throw new TypeError("Multiple dates require an array");
    return value;
  }
  if (mode === "range") {
    if (!("start" in value)) throw new TypeError("A date range requires start and end");
    if (!value.start && value.end) throw new TypeError("A range end requires a start");
    return [value.start, value.end].filter((date): date is DateValue => date !== null);
  }
  if (Array.isArray(value) || "start" in value) throw new TypeError("Single date requires a date or null");
  return [value];
}

export function selectionValue(mode: DateSelectionMode, values: DateValue[]): DateSelectionValue {
  if (mode === "multiple") return values;
  if (mode === "range") return { start: values[0] ?? null, end: values[1] ?? null };
  return values[0] ?? null;
}

/** Preserve the caller's calendar and time fields when choosing a calendar day. */
export function preserveDateType(day: DateValue, previous: DateValue | undefined): DateValue {
  if (!previous) return day;
  const converted = toCalendar(day, previous.calendar);
  return previous.set({ era: converted.era, year: converted.year, month: converted.month, day: converted.day });
}

export function validDateSelection(values: DateValue[], options: {
  min?: DateValue; max?: DateValue; locale: string;
  isDateUnavailable?: (date: DateValue, locale: string) => boolean;
  selectionMode: DateSelectionMode;
}): boolean {
  const valid = (date: DateValue) => (!options.min || date.compare(options.min) >= 0)
    && (!options.max || date.compare(options.max) <= 0)
    && !options.isDateUnavailable?.(date, options.locale);
  if (!values.every(valid)) return false;
  if (options.selectionMode !== "range" || values.length !== 2) return true;
  if (values[0]!.compare(values[1]!) > 0) return false;
  if (!options.isDateUnavailable) return true;
  // Range validation is intentionally synchronous; bound user-defined predicate work.
  let date = values[0]!;
  for (let count = 0; date.compare(values[1]!) <= 0; count++, date = date.add({ days: 1 })) {
    if (count >= 36600) return false;
    if (!valid(date)) return false;
  }
  return true;
}
