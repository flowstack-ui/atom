# DateInput

Segmented single-date or range entry. DateInput owns keyboard editing and canonical form serialization; it does not open a calendar.

## When to Use

Use for typing dates as localized segments. Use DatePicker when a popup calendar is also needed.

## Features

Contiguous range validation with an unavailable-date predicate is bounded to
36,600 days. Longer ranges are invalid; no exception is thrown during editing.

- Typed civil-date values preserve calendar information.
- Controlled and uncontrolled selection.
- Locale-ordered dates and direction-aware keyboard behavior.
- Explicit SSR reference date; no application business rules or date strings inferred.

## Import

```tsx
import { DateInput } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DateInput.Root>
  <DateInput.Context />
  <DateInput.Label />
  <DateInput.Control />
  <DateInput.SegmentGroup />
  <DateInput.Segments />
  <DateInput.Segment />
  <DateInput.ClearTrigger />
  <DateInput.HiddenInput />
</DateInput.Root>
```

Use Control for input groups. Popup composition belongs to DatePicker, not DateInput.

## API Reference

### Store and formatting

`useDateInput(options)` and `RootProvider value={input}` expose the same segmented
controller as Root. Context provides focus, setValue, clearValue, placeholderValue
and getSegments. Underscore-prefixed members are internal.

Root accepts formatter, format, placeholderValue/defaultPlaceholderValue,
onPlaceholderChange, translations and ids. A time-only formatter changes the
visible segments, not the value model: use a full DateValue with an explicit
reference date; submission still includes that date.

### Root

Owns controlled `value` / `onValueChange` or uncontrolled `defaultValue`. `referenceDate` is required and must agree between server and client. `selectionMode` defaults to `single`; its value is a date or null. `range` uses `{ start, end }`; Calendar and DatePicker also accept `multiple` with an array. `locale`, `timeZone`, `min`, `max`, `disabled`, `readOnly`, `invalid` and `isDateUnavailable` configure date behavior. Native div props pass through; this part does not support `asChild`.

### Context

Root additionally accepts `required`, `name`, `form`, `invalidMessage`, `segmentLabels`, `createCalendar`, `hourCycle` (12 or 24), `hideTimeZone`, `granularity` (day, hour, minute or second), `shouldForceLeadingZeros` and `getRootNode`. Locale defaults to en-US and timeZone to UTC. Zoned edits retain their supplied zone. Time-only values are not supported.


Calls `children` with the current context and renders no DOM. The corresponding public `useDateInputContext` hook requires Root.

### Label

Renders a label for a segment group. `index` defaults to 0; use 1 for the range end.

### Control

Groups the visible controls in a div. DatePicker Control also supplies the Popover anchor.

### SegmentGroup

Renders a group of editable segments. `index` defaults to 0; range end uses 1. Supply a Label or an explicit accessible name.

### Segments

Renders all locale-ordered segments for `index` (default 0), including literals. It creates no wrapper.

### Segment

Renders a span for a required `segment` object supplied by the context. `index` defaults to 0. Editable segments have spinbutton semantics; literals are not editable.

### ClearTrigger

Renders a button clearing the value. Disabled and read-only roots prevent clearing; `onClick` can prevent the action.

### HiddenInput

Renders a visually hidden validation and serialization input. `index` defaults to 0. Mount both endpoints for a range: names remain `name[start]` and `name[end]`. Date values serialize canonically, not as localized display text. `required`, `name`, `form` and `invalidMessage` come from Root. Controlled values remain application-owned during reset.

## Examples

### Data attributes

Root emits `[data-slot]="date-input"`. Editable segments expose `[data-disabled]`
and `[data-readonly]`; SegmentGroup exposes `[data-invalid]`. DateInput has no
calendar cells, popup, or popup state attributes.


```tsx
import { DateInput, parseDate } from "@flowstack-ui/atom";

export function Example() {
  return (
    <DateInput.Root referenceDate={parseDate("2026-09-05")} name="date">
      <DateInput.Label>Date</DateInput.Label>
      <DateInput.Control>
        <DateInput.SegmentGroup><DateInput.Segments /></DateInput.SegmentGroup>
      </DateInput.Control>
      <DateInput.HiddenInput />
    </DateInput.Root>
  );
}
```

## Accessibility

Provide an accessible name for each SegmentGroup, including separate start and
end labels for a range. Editable segments use spinbutton semantics; literal
separators are not editable. DateInput does not render a calendar or dialog.

| Key | Description |
| --- | --- |
| Arrow Up / Arrow Down | Adjust the focused editable segment. |
| Arrow Left / Arrow Right | Move between segments in the resolved direction. |

Compose HiddenInput for native validity, canonical submission and uncontrolled
reset; mount indices 0 and 1 for a range. DatePicker owns calendar selection and
popup Escape behavior when those capabilities are needed.

Automated behavior does not certify real assistive-technology or physical-device interaction. Follow the manual protocol before release qualification.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
