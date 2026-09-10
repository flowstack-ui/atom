"use client";

import * as engine from "@zag-js/date-picker";
import { normalizeProps, useMachine, mergeProps, type PropTypes } from "@zag-js/react";
import { createContext, forwardRef, useContext, useId, type HTMLAttributes, type ReactNode } from "react";
import { isSameDay, type DateValue } from "@internationalized/date";
import { useDirection } from "../direction/index.js";
import { useFieldContext } from "../field/context.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { selectionArray, selectionValue, preserveDateType, validDateSelection, type DateSelectionProps, type DateSelectionValue } from "./value.js";

export interface CalendarOptions extends Pick<engine.Props, "locale" | "timeZone" | "min" | "max" | "disabled" | "readOnly" | "invalid" | "isDateUnavailable" | "focusedValue" | "onFocusChange" | "view" | "defaultView" | "onViewChange" | "onVisibleRangeChange" | "numOfMonths" | "startOfWeek" | "fixedWeeks" | "outsideDaySelectable" | "showWeekNumbers" | "maxSelectedDates" | "createCalendar" | "translations" | "getRootNode"> {
  /** Stable initial focus/today reference, supplied by the application for SSR. */
  referenceDate: DateValue;
}
export type CalendarRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> & { dir?: "ltr" | "rtl" } & CalendarOptions & DateSelectionProps;
type CalendarApi = engine.Api<PropTypes>;
const Context = createContext<CalendarApi | null>(null);
const LocaleContext = createContext("en-US");
const ReferenceContext = createContext<DateValue | null>(null);
Context.displayName = "CalendarContext";
function useCalendarApi(): CalendarApi {
  const value = useContext(Context);
  if (!value) throw new Error("Calendar parts require Calendar.Root");
  return value;
}
export type CalendarContextValue = Pick<CalendarApi, "value" | "focusedValue" | "view" | "visibleRange" | "visibleRangeText">;
export function useCalendarContext(): CalendarContextValue {
  const { value, focusedValue, view, visibleRange, visibleRangeText } = useCalendarApi();
  return { value, focusedValue, view, visibleRange, visibleRangeText };
}

export const CalendarRoot = forwardRef<HTMLDivElement, CalendarRootProps>(function CalendarRoot(props, ref) {
  const { referenceDate, selectionMode = "single", value, defaultValue, onValueChange,
    children, id, dir, ...other } = props;
  const generatedId = useId();
  const direction = useDirection();
  const field = useFieldContext();
  const [options, native] = engine.splitProps(other);
  const locale = options.locale ?? "en-US";
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
        ?? `${resolved.today ? "Today. " : ""}${resolved.selected ? "Selected date. " : "Choose "}${resolved.valueText}`;
    } },
    inline: true, defaultFocusedValue: values[0] ?? referenceDate, selectionMode,
    disabled: options.disabled ?? field?.disabled,
    readOnly: options.readOnly ?? field?.readOnly,
    invalid: options.invalid ?? field?.invalid,
    value: values, defaultValue: selectionArray(selectionMode, defaultValue),
    onValueChange(details) {
      const next = details.value.map((date, index) => preserveDateType(date, values?.[index]));
      if (!validDateSelection(next, { ...options, locale, selectionMode })) return;
      setSelected(selectionValue(selectionMode, next));
    },
  });
  const api = engine.connect(service, normalizeProps);
  return <Context.Provider value={api}><LocaleContext.Provider value={locale}><ReferenceContext.Provider value={referenceDate}>
    <div {...mergeProps(api.getRootProps(), native)} data-slot="calendar" ref={ref}>
      <div {...api.getContentProps()} role="group" aria-roledescription={undefined} data-slot="calendar-content">{children}</div>
    </div>
  </ReferenceContext.Provider></LocaleContext.Provider></Context.Provider>;
});

export function CalendarContext({ children }: { children: (api: CalendarContextValue) => ReactNode }) {
  return children(useCalendarContext());
}

export const CalendarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CalendarHeader(props, ref) {
  const api = useCalendarApi();
  return <div {...mergeProps(api.getViewControlProps({ view: api.view }), props)} data-slot="calendar-header" ref={ref} />;
});

function navigation(kind: "Prev" | "Next" | "View") {
  return forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function CalendarNavigation(props, ref) {
    const api = useCalendarApi();
    const getters = { Prev: api.getPrevTriggerProps, Next: api.getNextTriggerProps, View: api.getViewTriggerProps };
    return <button {...mergeProps(getters[kind]({ view: api.view }), props)} data-slot={`calendar-${kind.toLowerCase()}-trigger`} ref={ref}>{props.children ?? (kind === "View" ? api.visibleRangeText.formatted : undefined)}</button>;
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

export interface CalendarGridProps extends HTMLAttributes<HTMLTableElement> {
  monthOffset?: number;
  hideOutsideDays?: boolean;
  renderDay?: (date: DateValue) => ReactNode;
}
export const CalendarGrid = forwardRef<HTMLTableElement, CalendarGridProps>(function CalendarGrid({ monthOffset = 0, hideOutsideDays, renderDay, ...props }, ref) {
  const api = useCalendarApi();
  const view = api.view;
  const numberFormat = new Intl.NumberFormat(useContext(LocaleContext), { useGrouping: false });
  const reference = useContext(ReferenceContext)!;
  const offset = api.getOffset({ months: monthOffset });
  const table = { view, id: `month-${monthOffset}` };
  const rows = view === "month" ? api.getMonthsGrid({ columns: 4 }) : api.getYearsGrid({ columns: 4 });
  return <table {...mergeProps(api.getTableProps(table), props)} data-slot="calendar-grid" ref={ref}>
    {view === "day" && <thead {...api.getTableHeadProps(table)}><tr {...api.getTableRowProps(table)}>
      {api.showWeekNumbers && <th {...api.getWeekNumberHeaderCellProps(table)} />}
      {api.weekDays.map(day => <th {...api.getTableHeaderProps(table)} key={day.long} abbr={day.long}>{day.narrow}</th>)}
    </tr></thead>}
    <tbody {...api.getTableBodyProps(table)}>
      {view === "day" ? offset.weeks.map((week, weekIndex) => <tr {...api.getTableRowProps(table)} key={week[0]!.toString()}>
        {api.showWeekNumbers && <td {...api.getWeekNumberCellProps({ week, weekIndex })}>{api.getWeekNumber(week)}</td>}
        {week.map(date => {
          const cell = { value: date, visibleRange: offset.visibleRange };
          const state = api.getDayTableCellState(cell);
          const trigger = api.getDayTableCellTriggerProps(cell);
          const today = isSameDay(date, reference);
          return <td {...api.getDayTableCellProps(cell)} aria-current={today ? "date" : undefined} key={date.toString()}>
            <button {...trigger} id={`${trigger.id}:month-${monthOffset}`} tabIndex={state.outsideRange ? -1 : trigger.tabIndex}
              data-today={today ? "" : undefined} data-slot="calendar-day" hidden={hideOutsideDays && state.outsideRange}>{renderDay?.(date) ?? numberFormat.format(date.day)}</button>
          </td>;
        })}
      </tr>) : rows.map((row, index) => <tr {...api.getTableRowProps(table)} key={index}>{row.map(item => {
        const cell = { value: item.value, columns: 4 };
        return <td {...(view === "month" ? api.getMonthTableCellProps(cell) : api.getYearTableCellProps(cell))} key={item.value}>
          <button {...(view === "month" ? api.getMonthTableCellTriggerProps(cell) : api.getYearTableCellTriggerProps(cell))} data-slot="calendar-period">{item.label}</button>
        </td>;
      })}</tr>)}
    </tbody>
  </table>;
});
