"use client";
export * from "./primitives/date-input/DateInput.js";
import { DateInputRoot, DateInputContext, DateInputLabel, DateInputControl, DateInputSegmentGroup, DateInputSegment, DateInputSegments, DateInputHiddenInput, DateInputClearTrigger } from "./primitives/date-input/DateInput.js";
export const DateInput = { Root: DateInputRoot, Context: DateInputContext, Label: DateInputLabel, Control: DateInputControl, SegmentGroup: DateInputSegmentGroup, Segment: DateInputSegment, Segments: DateInputSegments, HiddenInput: DateInputHiddenInput, ClearTrigger: DateInputClearTrigger } as const;
