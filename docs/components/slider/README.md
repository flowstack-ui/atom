# Slider

Headless slider primitives for single-value and range inputs.

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

Contains slider state.

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
| `disabled` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `name` | `string` | - |
| `form` | `string` | - |
| `ariaLabel` | `string` | - |
| `ariaValueText` | `(value: number) => string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |

### Track

Renders the pointer interaction surface.

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

Renders the selected range.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider-range"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-start]` | Normalized start percentage |
| `[data-end]` | Normalized end percentage |
| `[data-disabled]` | Present when disabled |

### Thumb

Renders a slider thumb.

| Prop | Type | Default |
| --- | --- | --- |
| `index` | `number` | `0` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider-thumb"` |
| `[data-value]` | Current thumb value |
| `[data-percent]` | Normalized current thumb percentage |

## Examples

### Single Value

```tsx
<Slider.Root defaultValue={50} ariaLabel="Volume">
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb />
  </Slider.Track>
</Slider.Root>
```

### Range

```tsx
<Slider.Root defaultValue={[20, 80]} minStepsBetweenThumbs={2}>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} />
    <Slider.Thumb index={1} />
  </Slider.Track>
</Slider.Root>
```

## Accessibility

Each `Slider.Thumb` receives `role="slider"` and value ARIA attributes.

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
