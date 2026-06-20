# Combobox

Text input with popup listbox, filtering helpers, option collection, selection state, and hidden form input.

## Features

- Controlled and uncontrolled selected value.
- Controlled and uncontrolled input value.
- Controlled and uncontrolled open state.
- Keyboard navigation with `aria-activedescendant`.
- Escape closes first, then clears when closed.
- Option groups, labels, empty/loading states, portal, and clear control.
- Hidden input for native form submission.

## Import

```tsx
import { Combobox } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Combobox.Root>
    <Combobox.Label />
    <Combobox.Input />
    <Combobox.Clear />
    <Combobox.Portal>
      <Combobox.Content>
        <Combobox.Listbox>
          <Combobox.Group>
            <Combobox.Label />
            <Combobox.Item />
          </Combobox.Group>
          <Combobox.Empty />
          <Combobox.Loading />
        </Combobox.Listbox>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>
);
```

## API Reference

### Root

Provides combobox state, filtering, and form integration.

| Prop | Type | Default |
| --- | --- | --- |
| `options` | `ComboboxOption[]` | `[]` |
| `value` | `string | null` | - |
| `defaultValue` | `string | null` | `null` |
| `onValueChange` | `(value: string | null) => void` | - |
| `inputValue` | `string` | - |
| `defaultInputValue` | `string` | `""` |
| `onInputValueChange` | `(value: string) => void` | - |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `openOnFocus` | `boolean` | `false` |
| `clearOnSelect` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `name` | `string` | - |
| `form` | `string` | - |

### Label

Labels either the combobox input or an option group, depending on where it is rendered.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-label"` |

### Input

Native input with `role="combobox"`.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"combobox-input"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-input"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-filled]` | Present when input has text |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Clear

Clears the current selection and input value.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"combobox-clear"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-clear"` |
| `[data-hidden]` | Present when there is nothing to clear or the root is inactive |

### Portal

Renders content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Popup content wrapper.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-content"` |
| `[data-state]` | `"open" | "closed"` |

### Listbox

Option listbox.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-listbox"` |

### Group

Groups related options.

| Prop | Type | Default |
| --- | --- | --- |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | Generated from nested label |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-group"` |

### Item

Selectable option.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `label` | `string` | - |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-item"` |
| `[data-state]` | `"checked" | "unchecked"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Option value |

### Empty

Empty-state slot.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-empty"` |

### Loading

Loading-state slot.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-loading"` |

## Examples

### Options With Filtering

```tsx
const options = [
  { value: "ny", label: "New York" },
  { value: "sf", label: "San Francisco" },
];

<Combobox.Root options={options} name="city">
  <Combobox.Label>City</Combobox.Label>
  <Combobox.Input />
  <Combobox.Clear />
  <Combobox.Content>
    <Combobox.Listbox>
      {options.map((option) => (
        <Combobox.Item key={option.value} value={option.value} label={option.label}>
          {option.label}
        </Combobox.Item>
      ))}
    </Combobox.Listbox>
  </Combobox.Content>
</Combobox.Root>
```

### Grouped Options

```tsx
<Combobox.Group>
  <Combobox.Label>Recent</Combobox.Label>
  <Combobox.Item value="apple" label="Apple">Apple</Combobox.Item>
</Combobox.Group>
```

## Accessibility

Implements an editable combobox that controls a listbox. Focus stays on the input while `aria-activedescendant` points at the highlighted option.

| Key | Description |
| --- | --- |
| `ArrowDown` | Opens the listbox or moves to the next enabled option. |
| `ArrowUp` | Opens the listbox or moves to the previous enabled option. |
| `Enter` | Selects the highlighted option. |
| `Escape` | Closes the listbox. When already closed, clears the selection/input. |
| `Home` | Moves the caret in the input unless list navigation is active. |
| `End` | Moves the caret in the input unless list navigation is active. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
