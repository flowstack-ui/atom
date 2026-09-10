# Date Value

Public date values and helpers from the pinned internationalized date runtime.
Use civil dates rather than UTC-midnight conversions for calendar-only values.

Import from `@flowstack-ui/atom/date-value` or the package root.

- `CalendarDate`, `CalendarDateTime`, `ZonedDateTime`: immutable date value classes.
- `parseDate`, `parseDateTime`, `parseZonedDateTime`, `parseAbsolute`: parse canonical values, not localized display text.
- `DateFormatter`: locale-aware display formatting.
- `toCalendar`, `toCalendarDate`, `toZoned`, `createCalendar`: explicit calendar and zone conversions.
- `today`, `now`, `getLocalTimeZone`: application-time helpers. Do not call during deterministic server/client initial render with different clocks or zones.
- `DateValue`, `CalendarSystem`, `CalendarIdentifier`: public value and calendar types.
- `DateSelectionMode`, `DateRangeValue`, `DateSelectionValue`: Atom selection contracts.

No DOM is rendered. Supply a stable reference date from the application to date controls.

```tsx
import { parseDate } from "@flowstack-ui/atom/date-value";
const date = parseDate("2026-09-05");
```
