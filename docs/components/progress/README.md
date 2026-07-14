# Progress

Determinate and indeterminate progressbar primitive.

## When to Use

Use `Progress` when work takes time and the user should know whether it is
still running or how much is complete. Pass a value when progress is measurable
and omit it when the amount is unknown. Use `Meter` for a stable measurement,
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
