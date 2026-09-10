"use client";
export * from "./primitives/date-picker/DatePicker.js";
import { DatePickerRoot, DatePickerLabel, DatePickerControl, DatePickerInput, DatePickerTrigger, DatePickerPortal, DatePickerContent, DatePickerCalendar, DatePickerClearTrigger, DatePickerContext, DatePickerValueText, DatePickerHiddenInput } from "./primitives/date-picker/DatePicker.js";
export const DatePicker = { Root: DatePickerRoot, Label: DatePickerLabel, Control: DatePickerControl, Input: DatePickerInput, Trigger: DatePickerTrigger, Portal: DatePickerPortal, Content: DatePickerContent, Calendar: DatePickerCalendar, ClearTrigger: DatePickerClearTrigger, Context: DatePickerContext, ValueText: DatePickerValueText, HiddenInput: DatePickerHiddenInput } as const;
