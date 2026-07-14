# Rating

Headless slider-like rating input with fractional values and decorative item parts.

## When to Use

Use `Rating` when a person chooses a score on a small ordered scale, such as
one to five stars. Use `Slider` when the value is a general numeric setting
like volume, and use `RadioGroup` when each choice has a different meaning
rather than simply being more or less.

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

Owns the numeric rating, form value, and slider semantics. It is the single
focusable control; Item parts only provide pointer targets and visual state.

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
| `onKeyDown` | `KeyboardEventHandler<HTMLDivElement>` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"slider"` |
| `aria-valuemin` | Normalized `min` |
| `aria-valuemax` | Normalized `max` |
| `aria-valuenow` | Current snapped value |
| `aria-valuetext` | Explicit or generated rating label |
| `aria-disabled` | `true` when disabled |
| `aria-readonly` | `true` when read-only |
| `aria-invalid` | `true` when invalid |
| `aria-required` | `true` when required |

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

Represents one point on the rating scale. It reports empty, partial, or full
fill state and forwards pointer interaction to Root while remaining decorative
to assistive technology.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | required |
| `onPointerDown` | `PointerEventHandler<HTMLSpanElement>` | - |
| `onPointerMove` | `PointerEventHandler<HTMLSpanElement>` | - |
| `onPointerUp` | `PointerEventHandler<HTMLSpanElement>` | - |
| `onPointerCancel` | `PointerEventHandler<HTMLSpanElement>` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true`; Root is the single slider control |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"rating-item"` |
| `[data-value]` | Item value |
| `[data-fill]` | Fill percentage from `0` to `100` |
| `[data-state]` | `"empty" \| "partial" \| "full"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

Advanced compound parts can read `useRatingContext` or use the exported
`RatingContextProvider`. Public helpers `normalizeRatingRange`,
`clampRatingValue`, `snapRatingValue`, `getRatingValueLabel`, and
`getRatingItemState` expose the calculations used by Root and Item.

## Examples

### Whole Star Rating

```tsx
import { Rating } from "@flowstack-ui/atom";

export default function WholeStarRating() {
  return (
    <Rating.Root defaultValue={3} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <Rating.Item key={value} value={value}>Star</Rating.Item>
      ))}
    </Rating.Root>
  );
}
```

### Fractional Rating

```tsx
import { Rating } from "@flowstack-ui/atom";

export default function FractionalRating() {
  return (
    <Rating.Root
      defaultValue={4.6}
      step={0.1}
      aria-label="Rating"
      getValueLabel={(value) => `${value} stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Rating.Item key={value} value={value}>Star</Rating.Item>
      ))}
    </Rating.Root>
  );
}
```

### Form Value

```tsx
import { Rating } from "@flowstack-ui/atom";

export default function ReviewRating() {
  return (
    <form>
      <Rating.Root name="rating" defaultValue={5} aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <Rating.Item key={value} value={value}>Star</Rating.Item>
        ))}
      </Rating.Root>
      <button type="submit">Submit review</button>
    </form>
  );
}
```

## Accessibility

Rating follows the
[WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
so the whole control is one Tab
stop. Items are decorative and hidden from assistive technology. Provide an
accessible name on Root with `aria-label` or `aria-labelledby`.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowUp` | Increases value by `step`; `ArrowRight` decreases in RTL. |
| `ArrowLeft` / `ArrowDown` | Decreases value by `step`; `ArrowLeft` increases in RTL. |
| `PageUp` | Increases value by `largeStep`. |
| `PageDown` | Decreases value by `largeStep`. |
| `Home` | Moves value to `min`. |
| `End` | Moves value to `max`. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
