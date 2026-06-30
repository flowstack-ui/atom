# Select

Single-value select with a combobox trigger, popup listbox, option collection, scroll controls, portal, and hidden form input.

## Features

- Controlled and uncontrolled selected value.
- Controlled and uncontrolled open state.
- Keyboard navigation, typeahead search, highlighting, and selection.
- Group, label, separator, viewport, scroll buttons, item text, and item indicator parts.
- Hidden input for native form submission.
- Stack-aware Escape dismissal when nested inside parent overlays.
- Integrates with `Field.Root` for trigger labels, descriptions, disabled state,
  and required state.
- Optional portal and popup arrow.

## Import

```tsx
import { Select } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Select.Root>
    <Select.Trigger>
      <Select.Value />
      <Select.Icon />
    </Select.Trigger>
    <Select.Portal>
      <Select.Content>
        <Select.ScrollUpButton />
        <Select.Viewport>
          <Select.Group>
            <Select.Label />
            <Select.Item>
              <Select.ItemText />
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Group>
          <Select.Separator />
        </Select.Viewport>
        <Select.ScrollDownButton />
        <Select.Arrow />
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
```

## API Reference

### Root

Provides select state and form integration.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `name` | `string` | - |
| `form` | `string` | - |

When used inside `Field.Root`, `disabled` and `required` default to the Field
state unless explicitly provided on `Select.Root`.

### Trigger

Combobox button that opens the listbox and owns keyboard interaction.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"select-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-disabled]` | Present when disabled |

When used inside `Field.Root`, `Trigger` uses the Field control ID and inherits
`aria-labelledby` / `aria-describedby` from the Field label and visible
description or error content. Explicit `id`, `aria-label`, `aria-labelledby`,
and `aria-describedby` props override this wiring.

Typing a printable character while the trigger is focused opens the listbox and
highlights the first enabled item whose label starts with the typed text.

### Value

Displays the selected option label or placeholder.

| Prop | Type | Default |
| --- | --- | --- |
| `placeholder` | `ReactNode` | - |
| `data-slot` | `string` | `"select-value"` |

### Icon

Decorative trigger icon slot.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"select-icon"` |

### Portal

Optionally portals select content.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content / Listbox

Popup listbox container. `Select.Content` is an alias for `Select.Listbox`.

| Prop | Type | Default |
| --- | --- | --- |
| `disablePortal` | `boolean` | `false` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-listbox"` |
| `[data-state]` | `"open" | "closed"` |

### Viewport

Scrollable item viewport used by scroll buttons.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-viewport"` |

### Group

Groups related options.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-group"` |

### Label

Labels a group.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-label"` |

### Item

Selectable option.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `disabled` | `boolean` | `false` |
| `label` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item"` |
| `[data-state]` | `"checked" | "unchecked"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Option value |

### ItemText

Registers item text for value display and accessible naming.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item-text"` |

### ItemIndicator

Renders when the item is selected.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item-indicator"` |

### Separator

Decorative item separator.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-separator"` |

### ScrollUpButton / ScrollDownButton

Scroll controls for overflowing viewports.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-scroll-up-button" | "select-scroll-down-button"` |
| `[data-disabled]` | Present when no scrolling is possible |

### Arrow

Decorative popup arrow slot.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-arrow"` |

## Examples

### Form Select

```tsx
import { Field, Select } from "@flowstack-ui/atom";

<Field.Root id="plan" required>
  <Field.Label>Plan</Field.Label>
  <Select.Root name="plan" defaultValue="pro">
    <Select.Trigger>
      <Select.Value placeholder="Choose a plan" />
      <Select.Icon />
    </Select.Trigger>
    <Select.Content>
      <Select.Viewport>
        <Select.Item value="starter">
          <Select.ItemText>Starter</Select.ItemText>
        </Select.Item>
        <Select.Item value="pro">
          <Select.ItemText>Pro</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
      </Select.Viewport>
    </Select.Content>
  </Select.Root>
</Field.Root>
```

### Grouped Options

```tsx
<Select.Group>
  <Select.Label>Plans</Select.Label>
  <Select.Item value="team">
    <Select.ItemText>Team</Select.ItemText>
  </Select.Item>
</Select.Group>
```

## Accessibility

Implements a button-based combobox that controls a listbox. The trigger owns keyboard interaction and references the highlighted option with `aria-activedescendant`.
Portalled Select content registers with a parent modal focus scope when opened
inside Dialog, Drawer, or another modal primitive.
Printable-character typeahead matches enabled option text; a single-character
search cycles forward from the current matching option, while multi-character
buffers match exact prefixes.

| Key | Description |
| --- | --- |
| `ArrowDown` | Opens the listbox or moves to the next enabled item. |
| `ArrowUp` | Opens the listbox from the last item or moves to the previous enabled item. |
| `Enter` | Opens the listbox or selects the highlighted item. |
| `Space` | Opens the listbox or selects the highlighted item. |
| `Home` | Highlights the first enabled item. |
| `End` | Highlights the last enabled item. |
| Printable character | Typeahead search. |
| `Escape` | Closes the listbox. |
| `Tab` | Closes the listbox and moves focus normally. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
