# Slider

The measured Thumb box describes visible containment geometry. Expand hit
targeting out of flow, or provide `thumbSize` explicitly; do not enlarge the
measured box solely for touch targeting. Scalar boundary fills reach the rail
caps, while ranges join thumb centers. Track activation accepts only primary
pointers and focuses the chosen thumb without scrolling. Off-center grabs
preserve their grab offset. Reset, controller replacement and geometry changes
invalidate stale pointer sessions.

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
- Supports Shift+Arrow large steps, scalar start/center/end fill origins,
  contained or centered endpoint alignment, and none/push/swap pointer
  collision policies.
- Exposes the same state owner through `useSlider`, `RootProvider`, and Context,
  including focused and dragging thumb indices.
- Provides Label, ValueText, marker anatomy, DraggingIndicator, and explicit
  HiddenInput parts without adding visual styling.
- Preserves page scrolling on the non-slider axis, reverts true pointer
  cancellation, and commits the latest value when capture is lost.
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
  <Slider.Label />
  <Slider.ValueText />
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    <Slider.Thumb />
    <Slider.DraggingIndicator />
    <Slider.MarkerGroup>
      <Slider.Marker>
        <Slider.MarkerIndicator />
        <Slider.MarkerLabel />
      </Slider.Marker>
    </Slider.MarkerGroup>
  </Slider.Control>
  <Slider.HiddenInput />
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
| `origin` | `"start" \| "center" \| "end"` | `"start"` |
| `thumbAlignment` | `"contain" \| "center"` | `"contain"` |
| `thumbSize` | `{ width: number; height: number }` | measured Thumb |
| `thumbCollisionBehavior` | `"none" \| "push" \| "swap"` | `"none"` |
| `hiddenInputMode` | `"automatic" \| "explicit"` | `"automatic"` |
| `onFocusChange` | `(index: number \| null) => void` | - |
| `disabled` | `boolean` | Field state or `false` |
| `readOnly` | `boolean` | Field state or `false` |
| `invalid` | `boolean` | Field state or `false` |
| `required` | `boolean` | Field state or `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `name` | `string` | - |
| `form` | `string` | - |
| `aria-label` | `string` | Field label relationship |
| `aria-labelledby` | `string` | Slider.Label or Field relationship |
| `aria-describedby` | `string` | Field messages |
| `ariaValueText` | `(value: number) => string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Root adds no role or ARIA attributes. Its label and value-text props
are applied to each Thumb.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"slider"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |
| `[data-origin]` | `"start" \| "center" \| "end"` |
| `[data-thumb-alignment]` | `"contain" \| "center"` |
| `[data-collision]` | `"none" \| "push" \| "swap"` |

### RootProvider and useSlider

`useSlider` creates the same controller used internally by Root. Pass exactly
one controller to RootProvider when external controls need values, focus, or
live/commit setters. Do not combine an independent Root state owner with a
controller.

### Context

Context exposes the nearest controller to a render function for custom
headless parts.

### Control

Owns pointer coordinate geometry. New compositions should place Track, thumbs,
and markers inside Control; legacy Track interaction remains supported.

### Label

Provides the generated label ID and focuses the first thumb when activated.
Distinct range endpoints should still use explicit Thumb names.

### ValueText

Renders external selected-value output. It is not a live region by default.

### Track

Registers the pointer interaction surface used to choose and drag the nearest
Thumb. It renders a `div` by default. Horizontal Tracks preserve vertical page
scrolling; vertical Tracks preserve horizontal scrolling.

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
| `aria-valuemin` | Effective minimum after the preceding thumb and required gap |
| `aria-valuemax` | Effective maximum before the following thumb and required gap |
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
| `[data-focus]` | Present on the focused Thumb |
| `[data-dragging]` | Present on the active pointer Thumb |

Explicit Thumb `aria-label`, `aria-labelledby`, `aria-describedby`, and
`aria-valuetext` values take precedence over Root-derived values. Root naming
takes precedence over Slider.Label or Field fallback.

### MarkerGroup, Marker, MarkerIndicator, and MarkerLabel

MarkerGroup is the shared decorative positioning region. Marker requires a
numeric `value` and exposes normalized position and selected state.
MarkerIndicator and MarkerLabel split artwork from text. Marker text does not
name a Thumb.

### DraggingIndicator

Renders only while its matching thumb is actively dragged. It is decorative
and clears on release, cancellation, capture loss, disable/read-only changes,
and unmount.

### HiddenInput

Renders one indexed hidden form value in `hiddenInputMode="explicit"`. The
default automatic mode already renders the inputs; never combine both modes.

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
      <Slider.Control>
        <Slider.Track><Slider.Range /></Slider.Track>
        <Slider.Thumb />
      </Slider.Control>
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
      <Slider.Control>
        <Slider.Track><Slider.Range /></Slider.Track>
        <Slider.Thumb index={0} aria-label="Minimum price" />
        <Slider.Thumb index={1} aria-label="Maximum price" />
      </Slider.Control>
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
Pointer cancellation restores the value present at pointer down and does not
call `onValueCommit`. Lost pointer capture finalizes the latest value so normal
browser capture release cannot make a completed click or drag jump backward.
Only one pointer session can control a Slider at a time.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowUp` | Increases the focused thumb by `step`; `ArrowRight` decreases in horizontal RTL. Hold Shift to use `largeStep`. |
| `ArrowLeft` / `ArrowDown` | Decreases the focused thumb by `step`; `ArrowLeft` increases in horizontal RTL. Hold Shift to use `largeStep`. |
| `PageUp` | Increases the focused thumb by `largeStep`. |
| `PageDown` | Decreases the focused thumb by `largeStep`. |
| `Home` | Moves the focused thumb to `min`. |
| `End` | Moves the focused thumb to `max`. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
