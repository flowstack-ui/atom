# Combobox

Headless editable combobox primitives for filtering suggestions and selecting a
value from a listbox.

## When to Use

Use Combobox when users should type to find an option, such as choosing a city
from a long list. Use Select when users must choose from a fixed list without
typing. Use Listbox when the choices should remain visible and no text input is
needed. Enable `freeSolo` only when typed values outside the option list are
valid.

## Features

- Controls selection, input text, and open state independently.
- Filters, groups, highlights, and selects options.
- Supports free-form values, loading, empty state, clearing, and disabled items.
- Positions Content with Floating UI and portals on request.
- Provides generated combobox/listbox ARIA relationships.
- Submits the selected value through a hidden named input.
- Exposes reusable option filtering, labeling, grouping, and navigation helpers.

## Import

```tsx
import { Combobox } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
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

useComboboxContext()
filterComboboxOptions()
getComboboxOptionLabel()
groupComboboxOptions()
getNextComboboxValue()
```

## API Reference

### Root

Owns all combobox state and renders no visible wrapper. When `name` is set, it
adds an accessibility-hidden input containing the selected value.

| Prop | Type | Default |
| --- | --- | --- |
| `options` | `ComboboxOption[]` | required |
| `value` | `string \| null` | - |
| `defaultValue` | `string \| null` | `null` |
| `onValueChange` | `(value: string \| null) => void` | - |
| `inputValue` | `string` | - |
| `defaultInputValue` | `string` | `""` |
| `onInputValueChange` | `(value: string) => void` | - |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `filterOptions` | `ComboboxFilter` | `filterComboboxOptions` |
| `groupBy` | `(option) => string` | - |
| `freeSolo` | `boolean` | `false` |
| `clearOnSelect` | `boolean` | `false` |
| `openOnFocus` | `boolean` | `true` |
| `loading` | `boolean` | `false` |
| `noOptionsText` | `ReactNode` | `"No options"` |
| `loadingText` | `ReactNode` | `"Loading"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `name` | `string` | - |
| `form` | `string` | - |

The hidden input receives `name`, `form`, value, and disabled state. Root does
not attach native `required` validation to that hidden input.

### Label

Labels Input when used outside Group and labels the option group when nested
inside Group. It renders `label` outside a group and `div` inside one.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-label"` |

### Input

Renders the editable input, controls the filter text, opens Content, and owns
all combobox keyboard interaction.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `autoComplete` | `string` | `"off"` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"combobox"` |
| `aria-expanded` | Current open state |
| `aria-haspopup` | `"listbox"` |
| `aria-controls` | Generated Listbox ID |
| `aria-activedescendant` | Highlighted Item ID while open |
| `aria-autocomplete` | `"list"` |
| `aria-required` | `"true"` when required |
| `aria-invalid` | `"true"` when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-input"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

### Clear

Clears the selected value and input, then returns focus to Input. It renders a
button and is hidden and disabled when no selected value exists or Root is
disabled/read-only.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Consumer value or `"Clear selection"` |
| `aria-hidden` | `"true"` while hidden |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-clear"` |
| `[data-hidden]` | Present while hidden |

### Portal

Moves its children to `document.body` by default without a wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element \| DocumentFragment \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Renders and positions the open popup below Input with flip and viewport-shift
collision handling. It owns no listbox role; place Listbox inside it.

| Prop | Type | Default |
| --- | --- | --- |
| `sideOffset` | `number` | `4` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-content"` |
| `[data-state]` | `"open"` |
| `[data-positioned]` | Present after positioning |

### Listbox

Contains the available options and receives the ID referenced by Input.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"listbox"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-listbox"` |
| `[data-state]` | `"open" \| "closed"` |

### Group

Groups related options. A nested Label supplies its generated accessible name;
native `aria-label` or `aria-labelledby` overrides that relationship.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-label` | Native label when supplied |
| `aria-labelledby` | Consumer ID or nested Label ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-group"` |

### Item

Represents one selectable option and registers its value in list order.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | Value or matching option label |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"option"` |
| `aria-selected` | Current selected state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-item"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-value]` | Item value |
| `[data-disabled]` | Present when disabled |

### Empty

Renders only when filtering produces no options and Root is not loading. Its
children default to `noOptionsText`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-empty"` |

### Loading

Renders only while Root is loading. Its children default to `loadingText`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"combobox-loading"` |

### useComboboxContext

Returns the current state and actions for advanced custom parts, including
`filteredOptions` and `groupedOptions`. It must be called below Root. Prefer the
namespaced parts for standard input, listbox, and option behavior.

### filterComboboxOptions

Returns options whose case-insensitive display label contains the input text.
An empty input returns the original options.

### getComboboxOptionLabel

Returns `option.label` when present, otherwise `option.value`.

### groupComboboxOptions

Groups options in encounter order using `groupBy`. Without `groupBy`, it
returns one group with a `null` label.

### getNextComboboxValue

Returns the next or previous value with wrapping. It returns `null` for an empty
array and begins at the first/last value when the current value is absent.

## Examples

### Choose a City

```tsx
import { Combobox, useComboboxContext } from "@flowstack-ui/atom";

const cities = [
  { value: "boston", label: "Boston" },
  { value: "chicago", label: "Chicago" },
  { value: "seattle", label: "Seattle" },
];

function CityOptions() {
  const { filteredOptions } = useComboboxContext();

  return filteredOptions.map((city) => (
    <Combobox.Item key={city.value} value={city.value}>
      {city.label}
    </Combobox.Item>
  ));
}

export function CityCombobox() {
  return (
    <Combobox.Root options={cities} name="city">
      <Combobox.Label>City</Combobox.Label>
      <Combobox.Input />
      <Combobox.Clear />
      <Combobox.Portal>
        <Combobox.Content>
          <Combobox.Listbox>
            <CityOptions />
            <Combobox.Empty />
          </Combobox.Listbox>
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
```

### Free-Form Controlled Value

```tsx
import { useState } from "react";
import { Combobox, useComboboxContext } from "@flowstack-ui/atom";

const tags = [{ value: "react" }, { value: "typescript" }];

function TagOptions() {
  const { filteredOptions } = useComboboxContext();

  return filteredOptions.map((tag) => (
    <Combobox.Item key={tag.value} value={tag.value} />
  ));
}

export function TagCombobox() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Combobox.Root options={tags} value={value} onValueChange={setValue} freeSolo>
      <Combobox.Label>Tag</Combobox.Label>
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Listbox>
          <TagOptions />
          <Combobox.Empty>No matching tag. Press Enter to create it.</Combobox.Empty>
        </Combobox.Listbox>
      </Combobox.Content>
    </Combobox.Root>
  );
}
```

## Accessibility

Combobox follows the
[WAI-ARIA Editable Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
Provide an accessible Label, render every available value as an Item, and keep
disabled options marked with `disabled`.

| Key | Description |
| --- | --- |
| `ArrowDown` | Opens and highlights the next enabled Item, wrapping at the end. |
| `ArrowUp` | Opens and highlights the previous enabled Item, wrapping at the start. |
| `Home` | Highlights the first enabled Item. |
| `End` | Highlights the last enabled Item. |
| `Enter` | Selects the highlighted Item, or commits free-form text when enabled. |
| `Escape` | Closes an open popup; when already closed, clears selection and input. |
| `Tab` | Closes the popup and continues normal focus movement. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
