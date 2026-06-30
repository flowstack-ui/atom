# Listbox

Headless listbox primitives for choosing one or more options from a visible option list.

## Features

- Implements WAI-ARIA listbox and option roles.
- Supports single and multiple selection.
- Supports controlled and uncontrolled values.
- Supports option groups and labels.
- Supports roving active option with `aria-activedescendant`.
- Supports typeahead, Home/End, arrow navigation, disabled options, form submission, and Field context.

## Import

```tsx
import { Listbox } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Listbox.Root>
  <Listbox.Group>
    <Listbox.Label />
    <Listbox.Option>
      <Listbox.OptionText />
    </Listbox.Option>
  </Listbox.Group>
</Listbox.Root>
```

## API Reference

### Root

Contains options and owns selection state.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | `null` or `[]` |
| `onValueChange` | `(value) => void` | - |
| `multiple` | `boolean` | `false` |
| `disabled` | `boolean` | Field value |
| `readOnly` | `boolean` | Field value |
| `required` | `boolean` | Field value |
| `invalid` | `boolean` | Field value |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `loop` | `boolean` | `true` |
| `name` | `string` | - |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-multiple]` | Present when multiple |
| `[data-filled]` | Present when one or more values are selected |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

### Option

Renders one selectable option.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-option"` |
| `[data-value]` | option value |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-selected]` | Present when selected |
| `[data-highlighted]` | Present when active |
| `[data-disabled]` | Present when disabled |

### OptionText

Labels an option and registers text for typeahead.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-option-text"` |

### Group and Label

Group related options and label the group.

| Part | Data slot |
| --- | --- |
| `Group` | `"listbox-group"` |
| `Label` | `"listbox-label"` |

## Examples

### Single Selection

```tsx
<Listbox.Root defaultValue="small" aria-label="Size">
  <Listbox.Option value="small">Small</Listbox.Option>
  <Listbox.Option value="large">Large</Listbox.Option>
</Listbox.Root>
```

### Multiple Selection

```tsx
<Listbox.Root multiple defaultValue={["red"]} aria-label="Colors">
  <Listbox.Option value="red">Red</Listbox.Option>
  <Listbox.Option value="blue">Blue</Listbox.Option>
</Listbox.Root>
```

## Accessibility

Implements the WAI-ARIA listbox pattern. The root keeps DOM focus and exposes the active option through `aria-activedescendant`.
Printable-character typeahead matches enabled option text; a single-character
search cycles forward from the current matching option, while multi-character
buffers match exact prefixes.

| Key | Description |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Moves active option in vertical orientation |
| `ArrowRight` / `ArrowLeft` | Moves active option in horizontal orientation |
| `Home` / `End` | Moves to first or last option |
| `Enter` / `Space` | Selects the active option |
| Printable character | Typeahead search |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
