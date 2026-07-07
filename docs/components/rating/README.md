# Rating

Headless slider-like rating input with fractional values and decorative item parts.

## Features

- Implements rating as a WAI-ARIA slider.
- Supports controlled and uncontrolled values.
- Supports fractional values with configurable `step`.
- Supports pointer selection, drag updates, keyboard control, and click-to-clear.
- Mirrors horizontal pointer and keyboard behavior in RTL direction.
- Supports disabled, read-only, invalid, and required states.
- Renders an optional hidden input for form submission.

## Import

```tsx
import { Rating } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Rating.Root>
  <Rating.Item value={1} />
  <Rating.Item value={2} />
  <Rating.Item value={3} />
  <Rating.Item value={4} />
  <Rating.Item value={5} />
</Rating.Root>
```

## API Reference

### Root

Contains rating state and slider semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | - |
| `defaultValue` | `number` | `min` |
| `onValueChange` | `(value: number) => void` | - |
| `min` | `number` | `0` |
| `max` | `number` | `5` |
| `step` | `number` | `1` |
| `largeStep` | `number` | `min(step * 10, half range snapped to step)` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `name` | `string` | - |
| `formValue` | `string` | Current value |
| `form` | `string` | - |
| `aria-valuetext` | `string` | - |
| `getValueLabel` | `(value, min, max) => string` | - |
| `tabIndex` | `number` | `0` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"rating"` |
| `[data-value]` | Current value |
| `[data-min]` | Minimum value |
| `[data-max]` | Maximum value |
| `[data-step]` | Step value |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |
| `[data-required]` | Present when required |

### Item

Renders one decorative rating item.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"rating-item"` |
| `[data-value]` | Item value |
| `[data-fill]` | Fill percentage from `0` to `100` |
| `[data-state]` | `"empty" \| "partial" \| "full"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

## Examples

### Whole Star Rating

```tsx
<Rating.Root defaultValue={3} aria-label="Rating">
  {[1, 2, 3, 4, 5].map((value) => (
    <Rating.Item key={value} value={value}>
      Star
    </Rating.Item>
  ))}
</Rating.Root>
```

### Fractional Rating

```tsx
<Rating.Root value={4.6} step={0.1} getValueLabel={(value) => `${value} stars`}>
  {[1, 2, 3, 4, 5].map((value) => (
    <Rating.Item key={value} value={value} />
  ))}
</Rating.Root>
```

### Form Value

```tsx
<Rating.Root name="rating" defaultValue={5}>
  {[1, 2, 3, 4, 5].map((value) => (
    <Rating.Item key={value} value={value} />
  ))}
</Rating.Root>
```

## Accessibility

Rating uses a slider model so the group is one tab stop. Items are decorative and hidden from assistive technology.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowUp` | Increases value by `step`; `ArrowRight` decreases in RTL. |
| `ArrowLeft` / `ArrowDown` | Decreases value by `step`; `ArrowLeft` increases in RTL. |
| `PageUp` | Increases value by `largeStep`. |
| `PageDown` | Decreases value by `largeStep`. |
| `Home` | Moves value to `min`. |
| `End` | Moves value to `max`. |

Provide an accessible name on `Rating.Root` with `aria-label` or `aria-labelledby`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
