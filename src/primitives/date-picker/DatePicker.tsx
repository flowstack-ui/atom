"use client";
import { createContext, forwardRef, useContext, useEffect, useId, useRef, type RefObject, type InputHTMLAttributes, type LabelHTMLAttributes, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes } from "react";
import { splitProps as splitCalendarProps } from "@zag-js/date-picker";
import { splitProps as splitInputProps } from "@zag-js/date-input";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import { CalendarRoot, type CalendarOptions } from "../calendar/Calendar.js";
import { DateInputRoot, DateInputControl, DateInputSegmentGroup, DateInputSegments, DateInputHiddenInput, type DateInputOptions, type DateInputRootProps } from "../date-input/DateInput.js";
import { PopoverRoot, PopoverAnchor, PopoverTrigger, PopoverPortal, PopoverContent, type PopoverContentProps } from "../popover/index.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { composeRefs } from "../../utils/slot.js";
import { selectionArray, selectionValue, validDateSelection, type DateSelectionProps, type DateSelectionValue } from "../calendar/value.js";
import { scheduleFirstInvalidFocus } from "../form/validation.js";
const Calendar = { Root: CalendarRoot };
const DateInput = { Root: DateInputRoot, Control: DateInputControl, SegmentGroup: DateInputSegmentGroup, Segments: DateInputSegments, HiddenInput: DateInputHiddenInput };
const Popover = { Root: PopoverRoot, Anchor: PopoverAnchor, Trigger: PopoverTrigger, Portal: PopoverPortal, Content: PopoverContent };

export type DatePickerRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> & CalendarOptions & DateInputOptions & DateSelectionProps & {
  dir?: "ltr" | "rtl";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  startLabel?: string;
  endLabel?: string;
};
interface PickerContext {
  props: DatePickerRootProps;
  value: DateSelectionValue;
  setValue: (value: DateSelectionValue) => void;
  setOpen: (open: boolean) => void;
  labelId: string;
  rootRef: RefObject<HTMLDivElement | null>;
}
const Context = createContext<PickerContext | null>(null);
Context.displayName = "DatePickerContext";
export function useDatePickerContext() {
  const context = useContext(Context);
  if (!context) throw new Error("DatePicker parts require DatePicker.Root");
  return context;
}
export const DatePickerRoot = forwardRef<HTMLDivElement, DatePickerRootProps>(function DatePickerRoot(props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const field = useFieldContext();
  const resolved = { ...props, disabled: props.disabled ?? field?.disabled, readOnly: props.readOnly ?? field?.readOnly,
    required: props.required ?? field?.required };
  const mode = props.selectionMode ?? "single";
  const [value, setValue] = useControllableState<DateSelectionValue>({ value: props.value,
    defaultValue: props.defaultValue ?? selectionValue(mode, []), onChange: props.onValueChange as ((value: DateSelectionValue) => void) | undefined });
  const [open, setOpen] = useControllableState({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const { referenceDate, invalidMessage, segmentLabels, closeOnSelect, onOpenChange, defaultOpen, startLabel, endLabel,
    value: suppliedValue, defaultValue, onValueChange, onFocusChange, onViewChange, onVisibleRangeChange, ...rest } = props;
  const [, calendarNative] = splitCalendarProps(rest);
  const [, native] = splitInputProps(calendarNative);
  useFormReset(rootRef, props.form, props.value !== undefined, () => {
    setValue(props.defaultValue ?? selectionValue(mode, []));
  });
  return <Context.Provider value={{ props: resolved, value, setValue, setOpen, labelId: `${props.id ?? generatedId}-label`, rootRef }}>
    <Popover.Root open={open && !resolved.disabled && !resolved.readOnly} onOpenChange={setOpen} disabled={resolved.disabled || resolved.readOnly}>
      <div {...native} ref={composeRefs(rootRef, ref)} id={props.id} dir={props.dir} data-slot="date-picker">{props.children}</div>
    </Popover.Root>
  </Context.Provider>;
});

export const DatePickerLabel = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function DatePickerLabel({ onClick, ...props }, ref) {
  const { labelId, rootRef, props: options } = useDatePickerContext();
  return <label id={labelId} {...props} ref={ref} data-slot="date-picker-label" onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || options.disabled) return;
    event.preventDefault();
    rootRef.current?.querySelector<HTMLElement>('[role="spinbutton"], [aria-haspopup="dialog"]')?.focus();
  }} />;
});

export const DatePickerControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DatePickerControl(props, ref) {
  return <Popover.Anchor asChild><div {...props} data-slot="date-picker-control" ref={ref} /></Popover.Anchor>;
});
export const DatePickerInput = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir">>(function DatePickerInput(props, ref) {
  const context = useDatePickerContext();
  const field = useFieldContext();
  const { props: options, value, setValue } = context;
  const { referenceDate, locale, timeZone, min, max, disabled, readOnly, required, invalid, isDateUnavailable, createCalendar,
    hourCycle, hideTimeZone, granularity, shouldForceLeadingZeros, getRootNode, name, form, invalidMessage, segmentLabels, dir } = options;
  const mode = options.selectionMode ?? "single";
  if (mode === "multiple") throw new Error("Multiple DatePicker uses ValueText, not a segmented Input");
  const inputProps = { referenceDate, locale, timeZone, min, max, disabled, readOnly, required, invalid, isDateUnavailable, createCalendar,
    hourCycle, hideTimeZone, granularity, shouldForceLeadingZeros, getRootNode, name, form, invalidMessage, segmentLabels, dir,
    selectionMode: mode, value, onValueChange: setValue } as DateInputRootProps;
  return <DateInput.Root {...inputProps} {...props} ref={ref}>
    <DateInput.Control>
      <DateInput.SegmentGroup aria-label={mode === "range" ? options.startLabel ?? "Start date" : props["aria-label"]} aria-labelledby={mode === "range" ? undefined : props["aria-labelledby"] ?? (props["aria-label"] ? undefined : field?.labelId ?? context.labelId)}><DateInput.Segments /></DateInput.SegmentGroup>
      {mode === "range" && <DateInput.SegmentGroup index={1} aria-label={options.endLabel ?? "End date"}><DateInput.Segments index={1} /></DateInput.SegmentGroup>}
    </DateInput.Control>
    <DateInput.HiddenInput />{mode === "range" && <DateInput.HiddenInput index={1} />}
  </DateInput.Root>;
});
export const DatePickerTrigger = Popover.Trigger;
export const DatePickerPortal = Popover.Portal;
export const DatePickerContent = forwardRef<HTMLDivElement, PopoverContentProps>(function DatePickerContent({ initialFocus, ...props }, ref) {
  const local = useRef<HTMLDivElement>(null);
  return <Popover.Content {...props} ref={composeRefs(local, ref)} initialFocus={initialFocus ?? (() => local.current?.querySelector<HTMLElement>('[data-slot="calendar-day"][tabindex="0"]') ?? local.current)} />;
});
export const DatePickerCalendar = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir">>(function DatePickerCalendar(props, ref) {
  const context = useDatePickerContext();
  const { props: options, value, setValue, setOpen } = context;
  const { referenceDate, locale, timeZone, min, max, disabled, readOnly, invalid, isDateUnavailable, focusedValue, onFocusChange,
    view, defaultView, onViewChange, onVisibleRangeChange, numOfMonths, startOfWeek, fixedWeeks, outsideDaySelectable, showWeekNumbers, maxSelectedDates, createCalendar, translations, getRootNode, dir } = options;
  const mode = options.selectionMode ?? "single";
  return <Calendar.Root {...{ referenceDate, locale, timeZone, min, max, disabled, readOnly, invalid, isDateUnavailable, focusedValue, onFocusChange,
    view, defaultView, onViewChange, onVisibleRangeChange, numOfMonths, startOfWeek, fixedWeeks, outsideDaySelectable, showWeekNumbers, maxSelectedDates, createCalendar, translations, getRootNode, dir }}
    {...({ selectionMode: mode, value, onValueChange(next: DateSelectionValue) {
      setValue(next);
      if (options.closeOnSelect !== false && mode !== "multiple" && selectionArray(mode, next).length === (mode === "range" ? 2 : 1)) setOpen(false);
    } } as DateSelectionProps)} {...props} ref={ref} />;
});
export const DatePickerClearTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function DatePickerClearTrigger({ onClick, ...props }, ref) {
  const { props: options, setValue } = useDatePickerContext();
  return <button {...props} ref={ref} type="button" disabled={props.disabled || options.disabled || options.readOnly} onClick={event => { onClick?.(event); if (!event.defaultPrevented) setValue(selectionValue(options.selectionMode ?? "single", [])); }} />;
});
export function DatePickerContext({ children }: { children: (context: PickerContext) => ReactNode }) { return children(useDatePickerContext()); }
export const DatePickerValueText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function DatePickerValueText(props, ref) {
  const { value, props: options } = useDatePickerContext();
  const formatter = new Intl.DateTimeFormat(options.locale ?? "en-US", { dateStyle: "medium", timeZone: options.timeZone ?? "UTC" });
  return <span {...props} ref={ref}>{props.children ?? selectionArray(options.selectionMode ?? "single", value).map(date => formatter.format(date.toDate(options.timeZone ?? "UTC"))).join(", ")}</span>;
});

/** Multiple-value form mirror. Single/range Input already renders its form controls. */
export const DatePickerHiddenInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue">>(function DatePickerHiddenInput(props, forwardedRef) {
  const { props: options, value, rootRef } = useDatePickerContext();
  const ref = useRef<HTMLInputElement>(null);
  const ownerRef = useRef<HTMLElement>(null);
  const field = useFieldContext();
  if (options.selectionMode !== "multiple") throw new Error("DatePicker.HiddenInput is for multiple selection; single/range Input includes form controls");
  const values = selectionArray("multiple", value);
  const valid = !options.invalid && validDateSelection(values, { ...options, locale: options.locale ?? "en-US", selectionMode: "multiple" });
  const validation = useFormValidation({ validityRef: ref, ownerRef,
    invalid: !valid && !options.disabled && !options.readOnly, inheritedInvalid: field?.invalid,
    validationBehavior: "inline", form: props.form ?? options.form, reportValidity: field?.reportControlValidity });
  useEffect(() => { ownerRef.current = rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="dialog"]') ?? null; });
  useEffect(() => { ref.current?.setCustomValidity(valid ? "" : options.invalidMessage ?? "Enter a valid date"); }, [valid, options.invalidMessage]);
  const name = props.name ?? options.name;
  return <>
    <input {...props} ref={composeRefs(ref, forwardedRef)} type="text" value={valid ? values[0]?.toString() ?? "" : ""} onChange={() => {}}
      name={name} form={props.form ?? options.form} disabled={options.disabled} readOnly={options.readOnly} required={options.required}
      tabIndex={-1} aria-hidden="true" data-slot="date-picker-hidden-input" data-atom-validation-owner="" data-atom-validation-behavior="inline"
      style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, border: 0, overflow: "hidden", clipPath: "inset(50%)", ...props.style }}
      onInvalid={event => {
        props.onInvalid?.(event);
        if (event.defaultPrevented) return;
        validation.validationProps.onInvalid(event);
        event.preventDefault();
        const trigger = rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="dialog"]');
        if (trigger) scheduleFirstInvalidFocus(event.currentTarget, trigger);
      }} />
    {valid && values.slice(1).map((date, index) => <input key={index} type="hidden" name={name} form={props.form ?? options.form} disabled={options.disabled} value={date.toString()} />)}
  </>;
});
