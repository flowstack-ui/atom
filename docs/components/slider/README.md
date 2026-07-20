# Slider

Headless slider primitives for single-value and range inputs.

## When to Use

Use `Slider` when someone adjusts a number by feel, such as volume, zoom, or a
price range. Use `NumberInput` when the exact typed number matters, and use
`Progress` when the value is read-only and only reports work being completed.

## Features

- Supports single-value and multi-thumb range values.
- Supports controlled and uncontrolled values.
- Supports horizontal and vertical orientation.
- Supports pointer dragging, keyboard changes, and commit callbacks.
- Supports hidden form inputs.
- Supports `Direction.Provider` for horizontal right-to-left pointer and
  keyboard behavior.
- Exposes geometry through data attributes and inline offset styles.

## Import

```tsx
import { Slider } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Slider.Root>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb />
  </Slider.Track>
</Slider.Root>
```

## API Reference

### Root

Owns the numeric range, thumb values, pointer calculations, keyboard changes,
and hidden form inputs. Root renders a `div`; each Thumb owns slider semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number \| number[]` | - |
| `defaultValue` | `number \| number[]` | `[min]` |
| `onValueChange` | `(value) => void` | - |
| `onValueCommit` | `(value) => void` | - |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `step` | `number` | `1` |
| `largeStep` | `number` | `step * 10` |
| `minStepsBetweenThumbs` | `number` | `0` |
| `disabled` | `boolean` | Field state or `false` |
| `readOnly` | `boolean` | Field state or `false` |
| `invalid` | `boolean` | Field state or `false` |
| `required` | `boolean` | Field state or `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `name` | `string` | - |
| `form` | `string` | - |
| `aria-label` | `string` | Field label relationship |
| `ariaValueText` | `(value: number) => string` | - |

**ARIA:** Root adds no role or ARIA attributes. Its label and value-text props
are applied to each Thumb.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |

### Track

Registers the pointer interaction surface used to choose and drag the nearest
Thumb. It renders a `div` by default.

**ARIA:** Track adds no role or ARIA attributes.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider-track"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |

### Range

Reports the selected start and end percentages and supplies the inline offset
geometry for a visual fill. It is decorative.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider-range"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-start]` | Normalized start percentage |
| `[data-end]` | Normalized end percentage |
| `[data-disabled]` | Present when disabled |

### Thumb

Renders one focusable slider control and connects its index to the matching
value in Root. Range sliders need one Thumb for each value.

| Prop | Type | Default |
| --- | --- | --- |
| `index` | `number` | `0` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"slider"` |
| `aria-valuemin` | Root minimum |
| `aria-valuemax` | Root maximum |
| `aria-valuenow` | Current thumb value |
| `aria-valuetext` | Result from `ariaValueText` when provided |
| `aria-orientation` | Root orientation |
| `aria-label` | Root label; numbered in a multi-thumb slider |
| `aria-disabled` | `true` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider-thumb"` |
| `[data-value]` | Current thumb value |
| `[data-percent]` | Normalized current thumb percentage |

Advanced compound parts can use `useSliderContext` and
`SliderContextProvider`. Public range, percentage, snapping, closest-thumb, and
offset helpers expose the same calculations used by the built-in parts.

## Examples

### Single Value

```tsx
import { Slider } from "@flowstack-ui/atom";

export default function VolumeSlider() {
  return (
    <Slider.Root defaultValue={50} aria-label="Volume">
      <Slider.Track><Slider.Range /><Slider.Thumb /></Slider.Track>
    </Slider.Root>
  );
}
```

### Range

```tsx
import { Slider } from "@flowstack-ui/atom";

export default function PriceRange() {
  return (
    <Slider.Root defaultValue={[20, 80]} minStepsBetweenThumbs={2} aria-label="Price">
      <Slider.Track>
        <Slider.Range />
        <Slider.Thumb index={0} />
        <Slider.Thumb index={1} />
      </Slider.Track>
    </Slider.Root>
  );
}
```

## Accessibility

Slider follows the [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).
Each Thumb is a focusable slider with its own value. Provide native
`aria-label`, or use Field for the label and messages. `ariaValueText` can
describe non-obvious values. Field state reaches every Thumb, read-only blocks
editing, and uncontrolled values reset to `defaultValue`.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowUp` | Increases the focused thumb by `step`; `ArrowRight` decreases in horizontal RTL. |
| `ArrowLeft` / `ArrowDown` | Decreases the focused thumb by `step`; `ArrowLeft` increases in horizontal RTL. |
| `PageUp` | Increases the focused thumb by `largeStep`. |
| `PageDown` | Decreases the focused thumb by `largeStep`. |
| `Home` | Moves the focused thumb to `min`. |
| `End` | Moves the focused thumb to `max`. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
