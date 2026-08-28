# ColorPicker

Color Picker is a headless compound control for hexadecimal color selection. It owns normalized controlled or uncontrolled state, form submission, preset selection, and optional Popover behavior; consumers own every visual treatment.

## When to Use

Use Color Picker when a form needs a color value selected through editable text, the browser's native color chooser, preset values, or a floating combination of those controls. Use a passive styled swatch when the interface only previews a color.

## Features

- Controlled and uncontrolled `#rrggbb` state with `#rgb` normalization.
- Editable text and native `type="color"` inputs.
- Accessible preset buttons with selected state.
- Optional Popover trigger and content built on Atom's existing focus and dismissal behavior.
- Hidden input form submission and Field state inheritance.

This first version deliberately supports opaque hexadecimal color values, the browser-native chooser, and preset buttons. It does not claim parity with area pickers, alpha channels, channel sliders or inputs, eyedroppers, format switching, or color-space conversion. Those capabilities can extend the same Root state and compound anatomy later without moving visual presentation into Atom; each extension requires its own accessibility, pointer, keyboard, and form contract before it is added.

## Import

```tsx
import { ColorPicker } from "@flowstack-ui/atom"
```

## Anatomy

```tsx
<ColorPicker.Root>
  <ColorPicker.Label />
  <ColorPicker.Control>
    <ColorPicker.Input />
    <ColorPicker.NativeInput />
    <ColorPicker.Trigger />
  </ColorPicker.Control>
  <ColorPicker.Content>
    <ColorPicker.SwatchTrigger />
  </ColorPicker.Content>
  <ColorPicker.HiddenInput />
</ColorPicker.Root>
```

## API Reference

### Root

Renders a `div`, provides picker state to every part, and hosts optional Popover behavior.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `"#000000"` |
| `onValueChange` | `(value: string) => void` | - |
| `open` / `defaultOpen` | `boolean` | - / `false` |
| `onOpenChange` | `(open, reason) => void` | - |
| `disabled`, `readOnly`, `invalid`, `required` | `boolean` | `false` |
| `name`, `form`, `inputId` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"color-picker"` |
| `[data-disabled]`, `[data-readonly]`, `[data-invalid]`, `[data-required]` | Present in the matching state |

### Label

Renders a `label` associated with the editable input.

### Control

Renders a structural `div` around controls.

### Input

Renders a text input. Valid `#rgb` and `#rrggbb` drafts update the picker; an invalid draft reverts on blur.

### NativeInput

Renders the browser-native `input[type=color]` and updates the shared value.

### Trigger

Renders Atom Popover's trigger with `data-slot="color-picker-trigger"`.

### Content

Renders positioned Atom Popover content and inherits its focus and dismissal contract.

### SwatchTrigger

Renders a preset `button` with `aria-pressed` and requires a hexadecimal `value`.

### HiddenInput

Renders the single hidden successful control used for form submission.

## Examples

```tsx
import { ColorPicker } from "@flowstack-ui/atom"

export function BrandColor() {
  return (
    <ColorPicker.Root name="brandColor" defaultValue="#5b5bd6">
      <ColorPicker.Label>Brand color</ColorPicker.Label>
      <ColorPicker.Control>
        <ColorPicker.Input />
        <ColorPicker.NativeInput />
      </ColorPicker.Control>
      <ColorPicker.HiddenInput />
    </ColorPicker.Root>
  )
}
```

## Accessibility

The editable and native inputs use native form semantics. `Label` names the editable text input through the native `for` relationship; `NativeInput` has the default accessible name “Open native color chooser,” which consumers may override. No generated `aria-labelledby` points to an optional or absent Label. Preset triggers are native buttons and expose `aria-pressed`; provide a descriptive `aria-label` when a hexadecimal value alone is not meaningful. Read-only pickers can still open for inspection while every mutating input and preset rejects edits. Optional floating content uses Atom Popover's keyboard, focus restoration, Escape, and outside-interaction behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
