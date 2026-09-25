# Calendar

Month tables use localized abbreviated labels by default. Use `monthFormat="long"` on Grid or MonthTable for full names. RangeText and ViewTrigger describe all visible months, regardless of selection mode.

Inline single, range, or multiple date selection. Calendar owns date-grid focus and selection, not an overlay.

## When to Use

Use for an always-visible date chooser. Use DatePicker when calendar selection belongs in a popup.

## Features

When an unavailable-date predicate is supplied, contiguous range validation is
bounded to 36,600 days. Longer ranges fail validation rather than executing an
unbounded user callback loop. This limit does not apply without that predicate.

- Typed civil-date values preserve calendar information.
- Controlled and uncontrolled selection.
- Locale-ordered dates and direction-aware keyboard behavior.
- Explicit SSR reference date; no application business rules or date strings inferred.

## Import

```tsx
import { Calendar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Calendar.Root>
  <Calendar.Context />
  <Calendar.Header />
  <Calendar.PrevTrigger />
  <Calendar.NextTrigger />
  <Calendar.ViewTrigger />
  <Calendar.MonthSelect />
  <Calendar.YearSelect />
  <Calendar.Grid />
</Calendar.Root>
```

Compose Header and Grid inside Root. Calendar is inline; use DatePicker for a popup.

## API Reference

### Store and composition

`useCalendar(options)` and `RootProvider value={calendar}` retain state outside
conditional content. `useCalendarContext` exposes value, focusedValue, view,
visibleRange/visibleRangeText and setValue/setFocusedValue/setView/clearValue.
Underscore-prefixed controller members are internal.

`minView` and `maxView` bound navigation. Terminal month/year selection returns
the start of the selected period as a DateValue, not its end timestamp. A period
is selectable when it includes an available date within the bounds.

`View view="day|month|year"` hides inactive content. `ViewControl` groups navigation
and `RangeText` shows the visible range. `Table`, `TableHead`, `TableBody`,
`TableRow`, `TableHeader`, `TableCell` and `TableCellTrigger` provide semantic
table composition. Cells take a DateValue for days or a numeric month/year.
Triggers inherit their cell value. `DayTable`, `MonthTable` and `YearTable`
are convenience grids; place fixed-view tables inside matching View parts.
Grid uses the same table parts, supports weekdayFormat narrow/short/long,
and hides outside days without collapsing their layout footprint.

### Root

Owns controlled `value` / `onValueChange` or uncontrolled `defaultValue`. `referenceDate` is required and must agree between server and client. `selectionMode` defaults to `single`; its value is a date or null. `range` uses `{ start, end }`; `multiple` uses an array. `locale`, `timeZone`, `min`, `max`, `disabled`, `readOnly`, `invalid` and `isDateUnavailable` configure date behavior. Native div props pass through. Root and RootProvider support `asChild` with one noninteractive host; the internal content region remains.

Calendar is not a native form input and supplies no named submission or reset
proxy. Applications own serialization and controlled reset when using it alone.
Use DatePicker when entry and native form participation should share one owner.

### Context

Root additionally accepts `focusedValue`/`onFocusChange`, `view`/`defaultView`/`onViewChange` (day, month or year), `onVisibleRangeChange`, `numOfMonths` (1), `startOfWeek`, `fixedWeeks`, `outsideDaySelectable` (false), `showWeekNumbers`, `maxSelectedDates`, `createCalendar`, `translations` and `getRootNode`. Locale defaults to en-US and timeZone to UTC. `referenceDate` defines today and initial empty focus. Supply createCalendar for non-Gregorian calendar systems.


Calls `children` with the current context and renders no DOM. The corresponding public `useCalendarContext` hook requires Root.

### Header

Renders a div grouping the current view's navigation controls.

### PrevTrigger

Renders a button navigating to the previous visible period. Availability follows date bounds.

### NextTrigger

Renders a button navigating to the next visible period. Availability follows date bounds.

### ViewTrigger

Renders a button moving from day to month to year selection. Its default text is the visible range.

### MonthSelect

Renders a native select for the focused month. Custom option children replace the generated options.

### YearSelect

Renders a native select for the focused year. Custom option children replace the generated options.

### Grid

Renders a table and date buttons for the current day, month or year view. `monthOffset` defaults to 0. `hideOutsideDays` omits outside-month button visibility. `renderDay(date)` customizes day content without taking over selection behavior. Supply an accessible name.

## Examples

### Data attributes

Root emits `[data-slot]="calendar"`. Calendar date cells expose `[data-selected]` and
`[data-unavailable]`. Popup state attributes belong to Popover, not Calendar.


```tsx
import { Calendar, parseDate } from "@flowstack-ui/atom";

export function Example() {
  return (
    <Calendar.Root referenceDate={parseDate("2026-09-05")}>
      <Calendar.Header>
        <Calendar.PrevTrigger>Previous</Calendar.PrevTrigger>
        <Calendar.ViewTrigger />
        <Calendar.NextTrigger>Next</Calendar.NextTrigger>
      </Calendar.Header>
      <Calendar.Grid aria-label="Choose a date" />
    </Calendar.Root>
  );
}
```

## Accessibility

Provide an accessible name for every input group and calendar grid. Calendar follows the
[APG date-picker grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
The inline Calendar is not a dialog. Popover owns popup focus behavior in DatePicker.

| Key | Description |
| --- | --- |
| Arrow keys | Move the focused calendar date. |
| Page Up / Page Down | Navigate calendar periods. |
| Enter / Space | Select a focused calendar date. |

Standalone Calendar has no popup to dismiss. DatePicker's Popover owns Escape
and focus return when composing calendar selection inside a popup.

Automated behavior does not certify real assistive-technology or physical-device interaction. Follow the manual protocol before release qualification.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
