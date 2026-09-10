# Calendar

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

### Root

Owns controlled `value` / `onValueChange` or uncontrolled `defaultValue`. `referenceDate` is required and must agree between server and client. `selectionMode` defaults to `single`; its value is a date or null. `range` uses `{ start, end }`; Calendar and DatePicker also accept `multiple` with an array. `locale`, `timeZone`, `min`, `max`, `disabled`, `readOnly`, `invalid` and `isDateUnavailable` configure date behavior. Native div props pass through; this part does not support `asChild`.

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

Root emits `[data-slot]="calendar"`. Editable segments expose `[data-disabled]`
and `[data-readonly]`; calendar date cells expose `[data-selected]` and
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
| Arrow keys | Change the focused calendar date or edit/move between input segments. |
| Page Up / Page Down | Navigate calendar periods. |
| Enter / Space | Select a focused calendar date. |
| Escape | Dismiss the DatePicker popup. |

Automated behavior does not certify real assistive-technology or physical-device interaction. Follow the manual protocol before release qualification.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
