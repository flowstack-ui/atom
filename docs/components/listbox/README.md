# Listbox

Headless listbox primitives for choosing one or more options from a visible option list.

## When to Use

Use Listbox when people need to choose from a list that stays visible, such as
selecting team members or assigning several tags. Use Select when the choices
should open from a compact trigger, Menu for commands such as Rename or Delete,
and native radio buttons or checkboxes when every choice should be a separate
form control.

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

Renders the focusable `listbox` container, owns selection and highlight state,
and submits selected values through hidden inputs when `name` is provided.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
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

| ARIA attribute | Values |
| --- | --- |
| `aria-activedescendant` | ID of the highlighted option |
| `aria-describedby` | Native value or inherited Field description IDs |
| `aria-disabled` | Present when disabled |
| `aria-invalid` | Present when invalid |
| `aria-multiselectable` | Present in multiple-selection mode |
| `aria-orientation` | `"vertical" \| "horizontal"` |
| `aria-readonly` | Present when read only |
| `aria-required` | Present when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox"` |
| `[data-multiple]` | Present when multiple |
| `[data-filled]` | Present when one or more values are selected |
| `[data-highlighted]` | Present while an option is highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

### Option

Renders one `option`, registers it for keyboard movement and typeahead, and
updates the root selection when it is clicked or activated from the keyboard.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `value` | `string` | required |
| `label` | `string` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-selected` | Whether the option is selected |
| `aria-disabled` | Present when the option or root is disabled |
| `aria-labelledby` | Generated `OptionText` ID when that part is mounted |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-option"` |
| `[data-value]` | option value |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-selected]` | Present when selected |
| `[data-highlighted]` | Present when active |
| `[data-disabled]` | Present when disabled |

### OptionText

Provides the option's accessible text and registers its rendered text for
typeahead. Use it when the option contains more than a simple text child.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-option-text"` |

### Group

Renders a `group` inside the listbox and connects it to its nested `Label`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-labelledby` | Generated ID of the nested `Label` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-group"` |

### Label

Names the surrounding `Group` and provides the ID used by its
`aria-labelledby` relationship.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `id` | `string` | generated |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"listbox-label"` |

Advanced compound components can use `useListboxContext`,
`useListboxOptionContext`, and `useListboxGroupContext`. Their matching context
providers and context value types are also public exports.

## Examples

### Single Selection

```tsx
import { Listbox } from "@flowstack-ui/atom";

export function SizeListbox() {
  return (
    <Listbox.Root defaultValue="small" aria-label="Size">
      <Listbox.Option value="small">Small</Listbox.Option>
      <Listbox.Option value="large">Large</Listbox.Option>
    </Listbox.Root>
  );
}
```

### Multiple Selection

```tsx
import { Listbox } from "@flowstack-ui/atom";

export function ColorListbox() {
  return (
    <Listbox.Root
      multiple
      defaultValue={["red"]}
      name="colors"
      aria-label="Colors"
    >
      <Listbox.Group>
        <Listbox.Label>Available colors</Listbox.Label>
        <Listbox.Option value="red">
          <Listbox.OptionText>Red</Listbox.OptionText>
        </Listbox.Option>
        <Listbox.Option value="blue">
          <Listbox.OptionText>Blue</Listbox.OptionText>
        </Listbox.Option>
      </Listbox.Group>
    </Listbox.Root>
  );
}
```

## Accessibility

Follows the [WAI-ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).
The root keeps DOM focus and exposes the active option through
`aria-activedescendant`. Give the root an accessible name with `aria-label`,
`aria-labelledby`, or Field labeling.
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
