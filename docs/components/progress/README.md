# Progress

Determinate and indeterminate progressbar primitive.

## When to Use

Use `Progress` when work takes time and the user should know whether it is
still running or how much is complete. Pass a value when progress is measurable
and omit it when the amount is unknown. Use native `<meter>` for a stable measurement,
such as storage used, because a meter does not mean that work is happening.

## Features

- Implements `role="progressbar"`.
- Supports determinate values and indeterminate progress.
- Normalizes invalid `min`/`max` ranges.
- Exposes progress state, value, min, max, and percent through data attributes.
- Supports custom assistive value text.

## Import

```tsx
import { Progress } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Progress.Root>
  <Progress.Indicator />
</Progress.Root>
```

## API Reference

### Root

Owns the progress range and the semantic value announced by assistive
technology. It normalizes the range and shares the result with `Indicator`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `number \| null` | `undefined` |
| `defaultValue` | `number \| null` | `null` |
| `onValueChange` | `(details: ProgressState) => void` | - |
| `ids` | `{ root?: string; label?: string }` | Generated |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `aria-valuetext` | `string` | - |
| `getValueLabel` | `(value: number, min: number, max: number) => string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"progressbar"` |
| `aria-valuemin` | Normalized minimum |
| `aria-valuemax` | Normalized maximum |
| `aria-valuenow` | Current value; omitted when indeterminate |
| `aria-valuetext` | Explicit or generated human-readable value |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"progress"` |
| `[data-state]` | `"loading" \| "complete" \| "indeterminate"` |
| `[data-min]` | Normalized minimum value |
| `[data-max]` | Normalized maximum value |
| `[data-value]` | Present when determinate |
| `[data-percent]` | Present when determinate |

### Indicator

Provides the visual fill hook for the current progress state. It repeats Root's
normalized values as data attributes and stays hidden from assistive technology.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` because Root owns the semantic value |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"progress-indicator"` |
| `[data-state]` | `"loading" \| "complete" \| "indeterminate"` |
| `[data-min]` | Normalized minimum value |
| `[data-max]` | Normalized maximum value |
| `[data-value]` | Present when determinate |
| `[data-percent]` | Present when determinate |

Advanced compound parts can read `useProgressContext` or use the exported
`ProgressContextProvider`. The public `clampProgressValue`,
`getProgressPercent`, and `getProgressState` helpers expose the same normalized
range calculations used by Root.

### Controller, RootProvider and Context

`useProgress(options?: UseProgressProps)` accepts value, defaultValue, min,
max, onValueChange and ids. It returns normalized `ProgressState`, stable
`ids.root`/`ids.label`, and `setValue(number | null)`. The setter clamps numeric
values and reports changed requests through onValueChange. Controlled value
wins until the application updates it; null is controlled unknown progress.
Changing min/max recalculates state without fabricating a value-change event.
Sequential uncontrolled updates in one event use the latest requested value;
returning to the prior rendered value still takes effect. Repeated normalized
no-op requests do not notify. Composed indeterminate hosts clear numeric
`aria-valuenow`, `data-value`, and `data-percent` values supplied by the child.

`Progress.RootProvider` accepts this controller as `value` plus Root's native,
render, asChild and accessible-value props. It does not accept a second range
or uncontrolled state. `Progress.Context` renders its function child with
the current context. `useProgressContext` reads the same context. The legacy
raw ProgressContextProvider remains available; its ids and setValue are
optional for compatibility with state-only providers.

```tsx
import { Progress, useProgress } from "@flowstack-ui/atom/progress";

function UploadProgress() {
  const progress = useProgress({ defaultValue: 0, ids: { label: "upload-label" } });
  return (
    <>
      <span id={progress.ids.label}>Upload</span>
      <Progress.RootProvider value={progress} aria-labelledby={progress.ids.label}>
        <Progress.Indicator />
      </Progress.RootProvider>
      <button onClick={() => progress.setValue(50)}>Simulate update</button>
    </>
  );
}
```

Root's explicit native id takes precedence over ids.root. Labels are authored
and connected through aria-labelledby; generating ids does not invent task
names or create a label element. Keep interactive help outside the semantic
Root. The controller never installs timers, keyboard adjustment or live regions.

### Invalid numeric inputs

NaN value is indeterminate; infinities clamp to range endpoints. A non-finite
minimum falls back to zero. Invalid/non-finite maximum becomes min + 100;
when that cannot form a distinct finite endpoint, the range becomes 0–100.
Extreme finite ranges use overflow-safe percentage calculations.
`clampProgressValue(NaN)` returns the normalized minimum and
`getProgressPercent(NaN)` returns zero; `getProgressState` instead retains the
unknown-value distinction. No helper emits a non-finite percentage.

## Examples

### Determinate progress

```tsx
import { Progress } from "@flowstack-ui/atom";

export default function UploadProgress() {
  return (
    <Progress.Root value={42} aria-label="Upload progress">
      <Progress.Indicator />
    </Progress.Root>
  );
}
```

### Indeterminate progress

Omit `value` or pass `null` when the current progress is unknown.

```tsx
import { Progress } from "@flowstack-ui/atom";

export default function LoadingProgress() {
  return (
    <Progress.Root value={null} aria-label="Loading results">
      <Progress.Indicator />
    </Progress.Root>
  );
}
```

### Custom value text

```tsx
import { Progress } from "@flowstack-ui/atom";

export default function SetupProgress() {
  return (
    <Progress.Root
      value={3}
      max={5}
      aria-label="Account setup"
      getValueLabel={(value, min, max) => `${value - min} of ${max - min} steps`}
    />
  );
}
```

## Accessibility

`Progress.Root` always sets `aria-valuemin` and `aria-valuemax`. It sets
`aria-valuenow` only when progress is determinate, as required by the
[WAI-ARIA progressbar role](https://www.w3.org/TR/wai-aria-1.2/#progressbar).
`Progress.Indicator` is always `aria-hidden`
because the root owns the semantic value. Progress is read-only and has no
keyboard interaction.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
