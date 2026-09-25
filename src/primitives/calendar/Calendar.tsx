"use client";

import * as engine from "@zag-js/date-picker";
import { normalizeProps, useMachine, mergeProps, type PropTypes } from "@zag-js/react";
import { Children, createContext, forwardRef, useContext, useId, useRef, useMemo, type ReactElement, type HTMLAttributes, type ReactNode } from "react";
import { composeRefs, cloneAndMerge } from "../../utils/slot.js";
import { useNativeDateDisabled } from "./useNativeDateDisabled.js";
import { isSameDay, type DateValue } from "@internationalized/date";
import { useDirection } from "../direction/index.js";
import { useFieldContext } from "../field/context.js";
import { useFieldsetContext } from "../fieldset/context.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { selectionArray, selectionValue, preserveDateType, validDateSelection, normalizeDatePeriod, type DateSelectionProps, type DateSelectionValue } from "./value.js";

export interface CalendarOptions extends Pick<engine.Props, "locale" | "timeZone" | "min" | "max" | "disabled" | "readOnly" | "invalid" | "isDateUnavailable" | "focusedValue" | "defaultFocusedValue" | "onFocusChange" | "view" | "defaultView" | "minView" | "maxView" | "onViewChange" | "onVisibleRangeChange" | "numOfMonths" | "startOfWeek" | "fixedWeeks" | "outsideDaySelectable" | "showWeekNumbers" | "maxSelectedDates" | "createCalendar" | "translations" | "ids" | "getRootNode"> {
  /** Stable initial focus/today reference, supplied by the application for SSR. */
  referenceDate: DateValue;
}
export type CalendarRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> & { dir?: "ltr" | "rtl"; asChild?: boolean } & CalendarOptions & DateSelectionProps;
type CalendarApi = engine.Api<PropTypes>;
const Context = createContext<CalendarApi | null>(null);
const LocaleContext = createContext("en-US");
const ReferenceContext = createContext<DateValue | null>(null);
type CalendarViewValue = "day" | "month" | "year";
const ViewContext = createContext<CalendarViewValue | undefined>(undefined);
type TableScope = { view: CalendarViewValue; monthOffset: number; columns: number; id: string };
const TableContext = createContext<TableScope | null>(null);
const CellContext = createContext<DateValue | number | null>(null);
Context.displayName = "CalendarContext";
LocaleContext.displayName = "CalendarLocaleContext";
ReferenceContext.displayName = "CalendarReferenceContext";
ViewContext.displayName = "CalendarViewContext";
TableContext.displayName = "CalendarTableContext";
CellContext.displayName = "CalendarCellContext";
function useCalendarApi(): CalendarApi {
  const value = useContext(Context);
  if (!value) throw new Error("Calendar parts require Calendar.Root");
  return value;
}
export type CalendarContextValue = Pick<CalendarApi, "value" | "focusedValue" | "view" | "visibleRange" | "visibleRangeText" | "setValue" | "setFocusedValue" | "setView" | "clearValue"> & {
  getWeeks: (monthOffset?: number) => DateValue[][];
  weekDays: { short: string; long: string; narrow: string }[];
};
export function useCalendarContext(): CalendarContextValue {
  const api = useCalendarApi();
  const { value, focusedValue, view, visibleRange, visibleRangeText, setValue, setFocusedValue, setView, clearValue, weekDays } = api;
  return { value, focusedValue, view, visibleRange, visibleRangeText, setValue, setFocusedValue, setView, clearValue, weekDays, getWeeks: (monthOffset = 0) => api.getOffset({ months: monthOffset }).weeks };
}

export function useCalendar(props: CalendarRootProps) {
  const { referenceDate, selectionMode = "single", value, defaultValue, onValueChange,
    children, id, dir, asChild, ...other } = props;
  const generatedId = useId();
  const direction = useDirection();
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const nativeDisabled = useNativeDateDisabled(rootRef);
  const [options, native] = engine.splitProps(other);
  // Keep native props symbolic in declarations for both React 18 and React 19.
  const nativeProps: HTMLAttributes<HTMLDivElement> = native;
  const locale = options.locale ?? "en-US";
  const views = ["day", "month", "year"];
  if (views.indexOf(options.minView ?? "day") > views.indexOf(options.maxView ?? "year")) throw new Error("Calendar minView must not exceed maxView");
  const [selected, setSelected] = useControllableState<DateSelectionValue>({ value, defaultValue: defaultValue ?? selectionValue(selectionMode, []), onChange: onValueChange as ((value: DateSelectionValue) => void) | undefined });
  const values = selectionArray(selectionMode, selected);
  const service = useMachine(engine.machine, {
    ...options, id: id ?? generatedId, dir: dir ?? direction, locale,
    isDateUnavailable: options.isDateUnavailable ? date => {
      if (selectionMode !== "range" || values.length !== 1) return options.isDateUnavailable!(date, locale);
      const ordered = values[0]!.compare(date) <= 0 ? [values[0]!, date] : [date, values[0]!];
      return !validDateSelection(ordered, { ...options, locale, selectionMode });
    } : undefined,
    translations: { ...options.translations, dayCell: state => {
      const resolved = { ...state, today: isSameDay(state.value, referenceDate) };
      return options.translations?.dayCell?.(resolved)
        ?? (locale.toLowerCase().startsWith("en") ? `${resolved.today ? "Today. " : ""}${resolved.selected ? "Selected date. " : "Choose "}${resolved.valueText}` : resolved.valueText);
    } },
    inline: true, defaultFocusedValue: options.defaultFocusedValue ?? values[0] ?? referenceDate, selectionMode,
    disabled: !!(nativeDisabled ?? fieldset?.disabled) || (options.disabled ?? field?.disabled),
    readOnly: options.readOnly ?? field?.readOnly,
    invalid: options.invalid ?? field?.invalid ?? fieldset?.invalid,
    value: values, defaultValue: selectionArray(selectionMode, defaultValue),
    onValueChange(details) {
      const next = details.value.map((date, index) => normalizeDatePeriod(preserveDateType(date, values?.[index]), options.minView));
      if (!validDateSelection(next, { ...options, locale, selectionMode })) return;
      setSelected(selectionValue(selectionMode, next));
    },
  });
  const api = engine.connect(service, normalizeProps);
  // The heading describes the visible window, not the selection mode.
  const { start, end } = api.visibleRangeText;
  api.visibleRangeText = { start, end, formatted: start === end ? start : `${start} - ${end}` };
  return { value: api.value, focusedValue: api.focusedValue, view: api.view, visibleRange: api.visibleRange, visibleRangeText: api.visibleRangeText,
    weekDays: api.weekDays, getWeeks: (monthOffset = 0) => api.getOffset({ months: monthOffset }).weeks,
    setValue: api.setValue, setFocusedValue: api.setFocusedValue, setView: api.setView, clearValue: api.clearValue,
    /** @internal */ _asChild: asChild,
    /** @internal */ _numOfMonths: options.numOfMonths ?? 1,
    /** @internal */ _api: api, /** @internal */ _native: nativeProps, /** @internal */ _children: children, /** @internal */ _locale: locale, /** @internal */ _referenceDate: referenceDate, /** @internal */ _rootRef: rootRef };
}
export type UseCalendarReturn = ReturnType<typeof useCalendar>;
export const CalendarRootProvider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value: UseCalendarReturn; asChild?: boolean }>(function CalendarRootProvider({ value, children, asChild = value._asChild, ...props }, ref) {
  const composedRef = useMemo(() => composeRefs(value._rootRef, ref), [value._rootRef, ref]);
  const child = children ?? value._children;
  const content = <div {...value._api.getContentProps()} role="group" aria-roledescription={undefined} data-slot="calendar-content">{asChild ? (Children.only(child) as ReactElement<{ children?: ReactNode }>).props.children : child}</div>;
  const host = { ...mergeProps(value._api.getRootProps(), value._native, props), "data-slot": "calendar", ref: composedRef, children: content };
  return <Context.Provider value={value._api}><LocaleContext.Provider value={value._locale}><ReferenceContext.Provider value={value._referenceDate}>
    {asChild ? cloneAndMerge(child, host) : <div {...host} />}
  </ReferenceContext.Provider></LocaleContext.Provider></Context.Provider>;
});
export const CalendarRoot = forwardRef<HTMLDivElement, CalendarRootProps>(function CalendarRoot(props, ref) {
  const value = useCalendar(props);
  return <CalendarRootProvider value={value} ref={ref} />;
});

export function CalendarContext({ children }: { children: (api: CalendarContextValue) => ReactNode }) {
  return children(useCalendarContext());
}

export const CalendarView = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { view: CalendarViewValue }>(function CalendarView({ view, ...props }, ref) {
  const api = useCalendarApi();
  return <ViewContext.Provider value={view}><div {...mergeProps(api.getViewProps({ view }), props)} hidden={api.view !== view} data-slot="calendar-view" ref={ref} /></ViewContext.Provider>;
});
export const CalendarRangeText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function CalendarRangeText({ children, ...props }, ref) {
  const api = useCalendarApi();
  return <span {...mergeProps(api.getRangeTextProps(), props)} data-slot="calendar-range-text" ref={ref}>{children ?? api.visibleRangeText.formatted}</span>;
});

export const CalendarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CalendarHeader(props, ref) {
  const api = useCalendarApi();
  const view = useContext(ViewContext) ?? api.view;
  return <div {...mergeProps(api.getViewControlProps({ view }), props)} data-slot="calendar-header" ref={ref} />;
});
export const CalendarViewControl = CalendarHeader;

function navigation(kind: "Prev" | "Next" | "View") {
  return forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(function CalendarNavigation({ asChild, ...props }, ref) {
    const api = useCalendarApi();
    const view = useContext(ViewContext) ?? api.view;
    const getters = { Prev: api.getPrevTriggerProps, Next: api.getNextTriggerProps, View: api.getViewTriggerProps };
    const host = { ...mergeProps(getters[kind]({ view }), props), "data-slot": `calendar-${kind.toLowerCase()}-trigger`, ref };
    if (asChild) { const { children, ...childHost } = host; return cloneAndMerge(children, childHost); }
    return <button {...host}>{props.children ?? (kind === "View" ? api.visibleRangeText.formatted : undefined)}</button>;
  });
}
export const CalendarPrevTrigger = navigation("Prev");
export const CalendarNextTrigger = navigation("Next");
export const CalendarViewTrigger = navigation("View");

function selection(kind: "month" | "year") {
  return forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function CalendarSelect(props, ref) {
    const api = useCalendarApi();
    return <select {...mergeProps(kind === "month" ? api.getMonthSelectProps() : api.getYearSelectProps(), props)} data-slot={`calendar-${kind}-select`} ref={ref}>
      {props.children ?? (kind === "month" ? api.getMonths() : api.getYears()).map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
    </select>;
  });
}
export const CalendarMonthSelect = selection("month");
export const CalendarYearSelect = selection("year");

export type CalendarTableProps = HTMLAttributes<HTMLTableElement> & { view?: CalendarViewValue; monthOffset?: number; columns?: number };
export const CalendarTable = forwardRef<HTMLTableElement, CalendarTableProps>(function CalendarTable({ view: suppliedView, monthOffset = 0, columns, ...props }, ref) {
  const api = useCalendarApi();
  const scopedView = useContext(ViewContext);
  const id = useId();
  const view = suppliedView ?? scopedView ?? api.view;
  const scope = { view, monthOffset, columns: columns ?? (view === "day" ? 7 : 4), id };
  return <TableContext.Provider value={scope}><table {...mergeProps(api.getTableProps(scope), props)} data-slot="calendar-grid" ref={ref} /></TableContext.Provider>;
});
function useTableScope() {
  const value = useContext(TableContext);
  if (!value) throw new Error("Calendar table parts require Calendar.Table");
  return value;
}
export const CalendarTableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function CalendarTableHead(props, ref) {
  const api = useCalendarApi(); const scope = useTableScope();
  return <thead {...mergeProps(api.getTableHeadProps(scope), props)} ref={ref} />;
});
export const CalendarTableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function CalendarTableBody(props, ref) {
  const api = useCalendarApi(); const scope = useTableScope();
  return <tbody {...mergeProps(api.getTableBodyProps(scope), props)} ref={ref} />;
});
export const CalendarTableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function CalendarTableRow(props, ref) {
  const api = useCalendarApi(); const scope = useTableScope();
  return <tr {...mergeProps(api.getTableRowProps(scope), props)} ref={ref} />;
});
export const CalendarTableHeader = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(function CalendarTableHeader(props, ref) {
  const api = useCalendarApi(); const scope = useTableScope();
  return <th {...mergeProps(api.getTableHeaderProps(scope), props)} scope="col" ref={ref} />;
});
export const CalendarTableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & { value: DateValue | number }>(function CalendarTableCell({ value, ...props }, ref) {
  const api = useCalendarApi(); const scope = useTableScope();
  if ((scope.view === "day") === (typeof value === "number")) throw new Error("Day cells require DateValue; month/year cells require a numeric value");
  const cell = scope.view === "day" ? api.getDayTableCellProps({ value: value as DateValue, visibleRange: api.getOffset({ months: scope.monthOffset }).visibleRange })
    : scope.view === "month" ? api.getMonthTableCellProps({ value: value as number }) : api.getYearTableCellProps({ value: value as number });
  return <CellContext.Provider value={value}><td {...mergeProps(cell, props)} ref={ref} /></CellContext.Provider>;
});
export const CalendarTableCellTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(function CalendarTableCellTrigger({ asChild, ...props }, ref) {
  const api = useCalendarApi(); const scope = useTableScope(); const value = useContext(CellContext);
  const reference = useContext(ReferenceContext)!;
  if (value === null) throw new Error("Calendar.TableCellTrigger requires Calendar.TableCell");
  const cell = scope.view === "day" ? { value: value as DateValue, visibleRange: api.getOffset({ months: scope.monthOffset }).visibleRange } : null;
  const state = cell ? api.getDayTableCellState(cell) : null;
  const trigger = cell ? api.getDayTableCellTriggerProps(cell) : scope.view === "month" ? api.getMonthTableCellTriggerProps({ value: value as number, columns: scope.columns }) : api.getYearTableCellTriggerProps({ value: value as number, columns: scope.columns });
  const host = { ...mergeProps(trigger, props), id: props.id ?? `${trigger.id}:${scope.id}`, tabIndex: state?.outsideRange ? -1 : props.tabIndex ?? trigger.tabIndex, "data-slot": scope.view === "day" ? "calendar-day" : "calendar-period", "data-today": cell && isSameDay(cell.value, reference) ? "" : undefined, ref };
  if (asChild) { const { children, ...childHost } = host; return cloneAndMerge(children, childHost); }
  return <button {...host} />;
});

export interface CalendarGridProps extends HTMLAttributes<HTMLTableElement> {
  monthOffset?: number;
  hideOutsideDays?: boolean;
  renderDay?: (date: DateValue) => ReactNode;
  weekdayFormat?: "narrow" | "short" | "long";
  /** Localized month labels. Short by default; long preserves complete names. */
  monthFormat?: "short" | "long";
  view?: CalendarViewValue;
}
export const CalendarGrid = forwardRef<HTMLTableElement, CalendarGridProps>(function CalendarGrid({ monthOffset = 0, hideOutsideDays, renderDay, weekdayFormat = "narrow", monthFormat = "short", view: suppliedView, ...props }, ref) {
  const api = useCalendarApi();
  const scopedView = useContext(ViewContext);
  const view = suppliedView ?? scopedView ?? api.view;
  const numberFormat = new Intl.NumberFormat(useContext(LocaleContext), { useGrouping: false });
  const reference = useContext(ReferenceContext)!;
  const offset = api.getOffset({ months: monthOffset });
  const table = { view, id: `month-${monthOffset}` };
  const rows = view === "month" ? api.getMonthsGrid({ columns: 4, format: monthFormat }) : api.getYearsGrid({ columns: 4 });
  return <CalendarTable {...props} view={view} monthOffset={monthOffset} data-month-format={view === "month" ? monthFormat : undefined} ref={ref}>
    {view === "day" && <CalendarTableHead><CalendarTableRow>
      {api.showWeekNumbers && <th {...api.getWeekNumberHeaderCellProps(table)} />}
      {api.weekDays.map(day => <CalendarTableHeader key={day.long} abbr={day.long}>{day[weekdayFormat]}</CalendarTableHeader>)}
    </CalendarTableRow></CalendarTableHead>}
    <CalendarTableBody>
      {view === "day" ? offset.weeks.map((week, weekIndex) => <CalendarTableRow key={week[0]!.toString()}>
        {api.showWeekNumbers && <td {...api.getWeekNumberCellProps({ week, weekIndex })}>{api.getWeekNumber(week)}</td>}
        {week.map(date => {
          const cell = { value: date, visibleRange: offset.visibleRange };
          const state = api.getDayTableCellState(cell);
          const today = isSameDay(date, reference);
          return <CalendarTableCell value={date} aria-current={today ? "date" : undefined} key={date.toString()}>
            <CalendarTableCellTrigger
              data-today={today ? "" : undefined} data-slot="calendar-day" data-outside-hidden={hideOutsideDays && state.outsideRange ? "" : undefined}
              aria-hidden={hideOutsideDays && state.outsideRange || undefined} style={hideOutsideDays && state.outsideRange ? { visibility: "hidden" } : undefined}>{renderDay?.(date) ?? numberFormat.format(date.day)}</CalendarTableCellTrigger>
          </CalendarTableCell>;
        })}
      </CalendarTableRow>) : rows.map((row, index) => <CalendarTableRow key={index}>{row.map(item => <CalendarTableCell value={item.value} key={item.value}>
          <CalendarTableCellTrigger>{item.label}</CalendarTableCellTrigger>
        </CalendarTableCell>)}</CalendarTableRow>)}
    </CalendarTableBody>
  </CalendarTable>;
});
export const CalendarDayTable = forwardRef<HTMLTableElement, Omit<CalendarGridProps, "view">>(function CalendarDayTable(props, ref) { return <CalendarGrid {...props} view="day" ref={ref} />; });
export const CalendarMonthTable = forwardRef<HTMLTableElement, Omit<CalendarGridProps, "view">>(function CalendarMonthTable(props, ref) { return <CalendarGrid {...props} view="month" ref={ref} />; });
export const CalendarYearTable = forwardRef<HTMLTableElement, Omit<CalendarGridProps, "view">>(function CalendarYearTable(props, ref) { return <CalendarGrid {...props} view="year" ref={ref} />; });
