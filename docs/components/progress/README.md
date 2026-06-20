# Progress

Determinate and indeterminate progressbar primitive.

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

Contains progressbar semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `number \| null` | `undefined` |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `aria-valuetext` | `string` | - |
| `getValueLabel` | `(value: number, min: number, max: number) => string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"progress"` |
| `[data-state]` | `"loading" \| "complete" \| "indeterminate"` |
| `[data-min]` | Normalized minimum value |
| `[data-max]` | Normalized maximum value |
| `[data-value]` | Present when determinate |
| `[data-percent]` | Present when determinate |

### Indicator

Decorative visual indicator.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"progress-indicator"` |
| `[data-state]` | `"loading" \| "complete" \| "indeterminate"` |
| `[data-min]` | Normalized minimum value |
| `[data-max]` | Normalized maximum value |
| `[data-value]` | Present when determinate |
| `[data-percent]` | Present when determinate |

## Examples

### Determinate progress

```tsx
<Progress.Root value={42}>
  <Progress.Indicator />
</Progress.Root>
```

### Indeterminate progress

Omit `value` or pass `null` when the current progress is unknown.

```tsx
<Progress.Root value={null}>
  <Progress.Indicator />
</Progress.Root>
```

### Custom value text

```tsx
<Progress.Root
  value={3}
  max={5}
  getValueLabel={(value, min, max) => `${value - min} of ${max - min} steps`}
/>
```

## Accessibility

`Progress.Root` always sets `aria-valuemin` and `aria-valuemax`. It sets
`aria-valuenow` only when progress is determinate, as required by the
progressbar pattern. `Progress.Indicator` is always `aria-hidden` because the
root owns the semantic value.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
