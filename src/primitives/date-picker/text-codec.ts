import { parseDate, toCalendarDate, type DateValue } from "@internationalized/date";
import { preserveDateType, normalizeDatePeriod, validDateSelection, type DateSelectionMode } from "../calendar/value.js";

export interface DatePickerCodecContext {
  locale: string;
  timeZone: string;
  referenceDate: DateValue;
  selectionMode: DateSelectionMode;
  index: number;
}
export interface DatePickerTextCodec {
  format: (date: DateValue, context: DatePickerCodecContext) => string;
  parse: (text: string, context: DatePickerCodecContext) => DateValue | undefined;
}
export interface DatePickerSelectionTextCodec {
  format: (dates: DateValue[], context: DatePickerCodecContext) => string;
  parse: (text: string, context: DatePickerCodecContext) => DateValue[] | undefined;
}

/** Strict calendar-date syntax. No locale inference, rollover, or ambient clock. */
export const isoDateTextCodec: DatePickerTextCodec = {
  format: date => toCalendarDate(date).toString(),
  parse(text) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
    try {
      const date = parseDate(text);
      return date.toString() === text ? date : undefined;
    } catch { return undefined; }
  },
};

export type DatePickerDraftResult =
  | { valid: true; values: DateValue[] }
  | { valid: false; values: [] };

/** Validate a draft without altering it or falling back to the focused date. */
export function parseDatePickerDraft(text: string, context: DatePickerCodecContext, options: {
  codec?: DatePickerTextCodec;
  selectionCodec?: DatePickerSelectionTextCodec;
  previous?: DateValue[];
  min?: DateValue;
  max?: DateValue;
  maxSelectedDates?: number;
  minView?: "day" | "month" | "year";
  isDateUnavailable?: (date: DateValue, locale: string) => boolean;
} = {}): DatePickerDraftResult {
  if (!text.trim()) return { valid: true, values: [] };
  try {
    const codec = options.codec ?? isoDateTextCodec;
    const parsed = context.selectionMode === "multiple"
      ? options.selectionCodec
        ? options.selectionCodec.parse(text, context)
        : text.split(";").map(part => codec.parse(part.trim(), context))
      : [codec.parse(text.trim(), context)];
    if (!parsed?.length || parsed.some(date => !date || typeof date.compare !== "function" || typeof date.toString !== "function")) return { valid: false, values: [] };
    // A date-only parser preserves existing time information. A custom datetime
    // parser owns the time it returned; never silently restore the old time.
    const values = (parsed as DateValue[]).map((date, index) => normalizeDatePeriod("hour" in date ? date : preserveDateType(date, options.previous?.[index]), options.minView));
    if (new Set(values.map(date => date.toString())).size !== values.length) return { valid: false, values: [] };
    if (context.selectionMode === "multiple" && options.maxSelectedDates !== undefined && values.length > options.maxSelectedDates) return { valid: false, values: [] };
    if (!validDateSelection(values, { ...options, locale: context.locale, selectionMode: context.selectionMode })) return { valid: false, values: [] };
    return { valid: true, values };
  } catch { return { valid: false, values: [] }; }
}
