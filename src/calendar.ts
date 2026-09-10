"use client";
export * from "./primitives/calendar/Calendar.js";
export type { DateSelectionProps, DateRangeValue } from "./primitives/calendar/value.js";
import { CalendarRoot, CalendarContext, CalendarHeader, CalendarPrevTrigger, CalendarNextTrigger, CalendarViewTrigger, CalendarMonthSelect, CalendarYearSelect, CalendarGrid } from "./primitives/calendar/Calendar.js";
export const Calendar = { Root: CalendarRoot, Context: CalendarContext, Header: CalendarHeader, PrevTrigger: CalendarPrevTrigger, NextTrigger: CalendarNextTrigger, ViewTrigger: CalendarViewTrigger, MonthSelect: CalendarMonthSelect, YearSelect: CalendarYearSelect, Grid: CalendarGrid } as const;
