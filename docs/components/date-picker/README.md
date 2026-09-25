# DatePicker

Shared date entry and calendar selection composed with Atom Popover. Calendar remains inline so only Popover owns positioning, dismissal and focus return.

## When to Use

Use when both keyboard date entry and popup date selection are needed. Use Calendar for a permanently visible chooser.

## Features

Text entry is additive: keep `Input` for segments, or set `entryMode="text"`
and use `TextInput` (a native input). Use `entryMode="none"` for button-only
selection. Text syntax defaults to strict `YYYY-MM-DD`; multiple values use
semicolons. Pair custom formatting/parsing in `textCodec`, or use
`selectionTextCodec` for an explicit multiple-value grammar. Invalid drafts remain
visible and cannot submit an older committed date. No implicit clamping occurs.

`useDatePicker` with `RootProvider value={store}` provides external control.
`IndicatorGroup` groups optional actions; `PresetTrigger value={...}` selects a
valid preset. Root owns automatic form controls; `formControl="manual"` permits
one explicit `HiddenInput`. Existing explicit HiddenInput in auto mode is unnamed
and does not duplicate submitted values. Do not access underscore-prefixed store
members: they connect the provider internally.

Contiguous range validation with an unavailable-date predicate is bounded to
36,600 days. Longer ranges are invalid; no exception is thrown during editing.

- Typed civil-date values preserve calendar information.
- Controlled and uncontrolled selection.
- Locale-ordered dates and direction-aware keyboard behavior.
- Explicit SSR reference date; no application business rules or date strings inferred.

## Import

```tsx
import { DatePicker } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DatePicker.Root>
  <DatePicker.Label />
  <DatePicker.Context />
  <DatePicker.Control />
  <DatePicker.Input />
  <DatePicker.ValueText />
  <DatePicker.Trigger />
  <DatePicker.Portal />
  <DatePicker.Content />
  <DatePicker.Calendar />
  <DatePicker.ClearTrigger />
  <DatePicker.HiddenInput />
</DatePicker.Root>
```

Use Control for input groups and Portal → Content → Calendar for popup content.

## API Reference

### Root

Owns controlled `value` / `onValueChange` or uncontrolled `defaultValue`. `referenceDate` is required and must agree between server and client. `selectionMode` defaults to `single`; its value is a date or null. `range` uses `{ start, end }`; Calendar and DatePicker also accept `multiple` with an array. `locale`, `timeZone`, `min`, `max`, `disabled`, `readOnly`, `invalid` and `isDateUnavailable` configure date behavior. Native div props pass through; this part does not support `asChild`.

### Label

Renders a label that names the default Input and focuses its first editable segment.
Supply explicit `aria-label` or `aria-labelledby` on Input when composing an external label.

### Context

Root combines Calendar and DateInput options. `open`/`onOpenChange` or `defaultOpen` control the popup. `closeOnSelect` defaults true for single and complete ranges; multiple remains open. `startLabel`/`endLabel` name endpoints (Start date/End date). `ValueText` formats selected values. Root owns canonical form mirrors for all entry paths; manual HiddenInput supports every selection mode. Multiple does not support segmented Input.


Calls `children` with the current context and renders no DOM. The corresponding public `useDatePickerContext` hook requires Root.

### Control

Groups the visible controls in a div. DatePicker Control also supplies the Popover anchor.

### Input

Composes segmented DateInput and form inputs using the coordinator value. Supply `aria-label` or `aria-labelledby`. Multiple selection uses ValueText rather than Input.

### ValueText

Renders a localized text representation of selection; explicit children replace the generated text. This is display-only and does not submit form values.

### Trigger

Uses Atom Popover.Trigger, including its composition, disabled state and open/close behavior.

### Portal

Uses Atom Popover.Portal; renders into the selected portal container rather than creating another overlay owner.

### Content

Uses Atom Popover.Content, including positioning, dismissal and focus return. Default initial focus targets the calendar's tabbable day; supply `initialFocus` to override.

### Calendar

Composes Calendar.Root using DatePicker's shared value. Selecting a complete single date or range closes the popup unless `closeOnSelect` is false; multiple selection stays open.

### ClearTrigger

Renders a button clearing the value. Disabled and read-only roots prevent clearing; `onClick` can prevent the action.

### HiddenInput

For multiple selection, renders canonical form values under repeated `name` entries.
The first visually hidden input also validates `required` and date constraints.
Use with ValueText and Trigger. Do not mount it beside single/range Input, which
already owns the form controls. The root coordinator owns reset.

## Examples

### Data attributes

Root emits `[data-slot]="date-picker"`. Editable segments expose `[data-disabled]`
and `[data-readonly]`; calendar date cells expose `[data-selected]` and
`[data-unavailable]`. Popup state attributes belong to Popover, not Calendar.


```tsx
import { DatePicker, Calendar, parseDate } from "@flowstack-ui/atom";

export function Example() {
  return (
    <DatePicker.Root referenceDate={parseDate("2026-09-05")} name="date">
      <DatePicker.Control>
        <DatePicker.Input aria-label="Date" />
        <DatePicker.Trigger>Choose date</DatePicker.Trigger>
      </DatePicker.Control>
      <DatePicker.Portal>
        <DatePicker.Content aria-label="Choose date">
          <DatePicker.Calendar>
            <Calendar.Header>
              <Calendar.PrevTrigger>Previous</Calendar.PrevTrigger>
              <Calendar.ViewTrigger />
              <Calendar.NextTrigger>Next</Calendar.NextTrigger>
            </Calendar.Header>
            <Calendar.Grid aria-label="Choose date" />
          </DatePicker.Calendar>
        </DatePicker.Content>
      </DatePicker.Portal>
    </DatePicker.Root>
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
