# ColorPicker

Color Picker is a headless compound control for editing one color through a
two-dimensional area, channel sliders and inputs, hexadecimal text, a native
platform chooser, presets, format controls, or a progressive screen
eyedropper. Atom owns behavior and semantics; consumers own every visual
treatment.

## When to Use

Use Color Picker when a form, editor, or settings surface needs a selectable
color. Use a passive styled-layer Color Swatch when the interface only previews
a color. Saved palettes and persistence remain application state.

## Features

- Controlled or uncontrolled RGBA, HSLA, and HSBA color state.
- Parsing for hexadecimal, RGB(A), HSL(A), and HSB(A) strings.
- Pointer, touch, keyboard, RTL, and drag-completion behavior for the color area
  and channel sliders.
- Hex/CSS and numeric channel inputs, including alpha.
- Controlled or uncontrolled format and open state.
- Inline or positioned popup composition.
- Value swatch/text, preset groups, selection indicators, and optional
  close-on-select behavior.
- Progressive EyeDropper support that treats cancellation or lack of browser
  support as a no-op.
- One successful form control, required/disabled/read-only/invalid state,
  external form association, and uncontrolled form reset.
- The browser-native `input[type=color]` remains available as an opaque-color
  platform fallback; it does not replace Atom's full area and alpha behavior.

## Import

```tsx
import { ColorPicker, parseColorPickerValue } from "@flowstack-ui/atom"
```

## Anatomy

```tsx
<ColorPicker.Root>
  <ColorPicker.Label />
  <ColorPicker.Control>
    <ColorPicker.ValueSwatch />
    <ColorPicker.Input />
    <ColorPicker.Trigger />
  </ColorPicker.Control>
  <ColorPicker.Positioner>
    <ColorPicker.Content>
      <ColorPicker.Area>
        <ColorPicker.AreaBackground />
        <ColorPicker.AreaThumb />
      </ColorPicker.Area>
      <ColorPicker.ChannelSlider channel="hue">
        <ColorPicker.ChannelSliderTrack />
        <ColorPicker.ChannelSliderThumb />
      </ColorPicker.ChannelSlider>
      <ColorPicker.ChannelSlider channel="alpha">
        <ColorPicker.TransparencyGrid />
        <ColorPicker.ChannelSliderTrack />
        <ColorPicker.ChannelSliderThumb />
      </ColorPicker.ChannelSlider>
      <ColorPicker.ChannelInput channel="red" />
      <ColorPicker.FormatSelect />
      <ColorPicker.EyeDropperTrigger />
      <ColorPicker.SwatchGroup>
        <ColorPicker.SwatchTrigger value="#5b5bd6">
          <ColorPicker.Swatch value="#5b5bd6">
            <ColorPicker.SwatchIndicator />
          </ColorPicker.Swatch>
        </ColorPicker.SwatchTrigger>
      </ColorPicker.SwatchGroup>
    </ColorPicker.Content>
  </ColorPicker.Positioner>
  <ColorPicker.HiddenInput />
</ColorPicker.Root>
```

## API Reference

| Prop | Type | Default |
| --- | --- | --- |
| `value`, `defaultValue` | `string \| Color` | - / `"#000000"` |
| `onValueChange` | `(details: { value; valueAsString }) => void` | - |
| `onValueChangeEnd` | `(details: { value; valueAsString }) => void` | - |
| `format`, `defaultFormat` | `"rgba" \| "hsla" \| "hsba"` | - / `"rgba"` |
| `onFormatChange` | `(details: { format }) => void` | - |
| `open`, `defaultOpen` | `boolean` | - / `false` |
| `onOpenChange` | `(details: { open; value }) => void` | - |
| `inline`, `closeOnSelect`, `openAutoFocus` | `boolean` | `false`, `false`, `true` |
| `positioning`, `initialFocusEl` | positioning/focus configuration | - |
| `disabled`, `readOnly`, `invalid`, `required` | `boolean` | `false` |
| `name`, `form`, `inputId`, `dir` | `string` | - |

`onValueChange` runs throughout editing. Use `onValueChangeEnd` for expensive
work that should wait until a pointer drag, committed channel input, or
eyedropper choice finishes; area and slider keyboard steps remain ordinary
value changes. `valueAsString`
follows the active Root format; the `Color` object can
serialize to `hex`, `hexa`, `rgb`, `rgba`, `hsl`, `hsla`, `hsb`, `hsba`, or
`css`.

## Parts

- `Label`, `Control`, `Trigger`, `Positioner`, and `Content` form a positioned
  picker. Set `inline` and omit Trigger/Positioner for an inline picker.
- `Area`, `AreaBackground`, and `AreaThumb` form the accessible 2D slider.
  `xChannel` and `yChannel` may customize the axes.
- `ChannelSlider` requires `channel` and may be horizontal or vertical. Its
  Label, Track, Thumb, and ValueText inherit that channel.
- `ChannelInput` accepts `red`, `green`, `blue`, `hue`, `saturation`,
  `brightness`, `lightness`, `alpha`, `hex`, or `css`. `Input` is the stable
  hexadecimal shortcut.
- `ValueSwatch` and `ValueText` expose the current color. `Swatch`,
  `SwatchTrigger`, `SwatchGroup`, and `SwatchIndicator` compose palettes.
- `FormatTrigger` cycles HSBA, HSLA, and RGBA. `FormatSelect` renders those
  options by default and accepts authored options.
- `View format="…"` conditionally reveals format-specific composition.
- `TransparencyGrid` paints only the transparency reference; the styled layer
  owns its shape and containment.
- `EyeDropperTrigger` uses the browser EyeDropper API when available and leaves
  the value unchanged on unsupported platforms, cancellation, or platform
  error.
- `NativeInput` uses the platform's native opaque chooser; selecting through it
  produces an opaque color. Do not present it as a cross-browser replacement
  for alpha editing.
- `HiddenInput` is the single successful form control. Render it when `name`
  must submit.
- `Context` exposes the current headless API to an application render function.

## Example

```tsx
import { ColorPicker } from "@flowstack-ui/atom"

const presets = ["#5b5bd6", "#2f9e44", "#e8590c"]

export function BrandColor() {
  return (
    <ColorPicker.Root name="brandColor" defaultValue="#5b5bd6" inline>
      <ColorPicker.Label>Brand color</ColorPicker.Label>
      <ColorPicker.Area>
        <ColorPicker.AreaBackground />
        <ColorPicker.AreaThumb />
      </ColorPicker.Area>
      <ColorPicker.ChannelSlider channel="hue">
        <ColorPicker.ChannelSliderTrack />
        <ColorPicker.ChannelSliderThumb />
      </ColorPicker.ChannelSlider>
      <ColorPicker.ChannelSlider channel="alpha">
        <ColorPicker.TransparencyGrid />
        <ColorPicker.ChannelSliderTrack />
        <ColorPicker.ChannelSliderThumb />
      </ColorPicker.ChannelSlider>
      <ColorPicker.SwatchGroup aria-label="Brand presets">
        {presets.map((value) => (
          <ColorPicker.SwatchTrigger key={value} value={value}>
            <ColorPicker.Swatch value={value}>
              <ColorPicker.SwatchIndicator>Selected</ColorPicker.SwatchIndicator>
            </ColorPicker.Swatch>
          </ColorPicker.SwatchTrigger>
        ))}
      </ColorPicker.SwatchGroup>
      <ColorPicker.Input aria-label="Hex color" />
      <ColorPicker.HiddenInput />
    </ColorPicker.Root>
  )
}
```

## Accessibility

Render a persistent `Label` or provide explicit accessible names. The area
thumb uses an ARIA 2D-slider description and supports arrow and page keys.
Channel thumbs expose their range, orientation, channel, value, Home/End,
arrow, and page-key behavior. Presets are native buttons with checked state.
Positioned content is a dismissible dialog that restores trigger focus. RTL
mirrors horizontal area and slider movement. Read-only and disabled parts do
not mutate. Color must never be the only visible or announced signal; provide
text when a raw value is not meaningful.

The EyeDropper API is progressive enhancement and normally requires a secure
context plus user activation. Cancellation is not an error state. Verify the
finished styled composition with keyboard, pointer, zoom, forced colors, and
assistive technology.

## Data Attributes

Every part exposes a stable `data-slot` plus the machine-owned `data-scope` and
`data-part`. State hooks include `data-state`, `data-disabled`, `data-readonly`,
`data-invalid`, `data-orientation`, `data-channel`, and `data-format`. Atom
provides behavioral inline styles and color variables such as `--value` and
`--color`; styled layers must merge rather than replace those values.

## Styling Contract

Atom intentionally supplies no visual recipe. Consumers may style the data
attributes and variables above while preserving the machine-owned geometry and
interaction styles.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
