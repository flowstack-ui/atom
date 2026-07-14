# Select

Single-value select with a combobox trigger, popup listbox, option collection, scroll controls, portal, and hidden form input.

## When to Use

Use `Select` when the user chooses one value from a list and the choices should
stay hidden until needed. Use `RadioGroup` when a short list should remain
visible for easy comparison, and use `Combobox` when users need to type to
filter or enter a value.

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

<Select.Listbox />
```

## API Reference

### Root

Owns value, open state, item registration, form submission, and Field
integration. Root renders no DOM wrapper except its hidden form input when
`name` is provided.

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

**ARIA:** Root renders no semantic element. Trigger and Content own the ARIA
contract.

**Data attributes:** Root renders no wrapper and exposes none.

When used inside `Field.Root`, `disabled` and `required` default to the Field
state unless explicitly provided on `Select.Root`.

### Trigger

Combobox button that opens the listbox and owns keyboard interaction.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"combobox"` |
| `aria-haspopup` | `"listbox"` |
| `aria-expanded` | Current open state |
| `aria-controls` | Generated Content/Listbox ID |
| `aria-activedescendant` | Highlighted Item ID while open |
| `aria-label` | Explicit native value or value from `ariaLabel` |
| `aria-labelledby` | Explicit IDs or inherited Field label ID |
| `aria-describedby` | Explicit IDs or inherited Field description/error IDs |
| `aria-disabled` | `true` when disabled |
| `aria-required` | `true` when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

When used inside `Field.Root`, `Trigger` uses the Field control ID and inherits
`aria-labelledby` / `aria-describedby` from the Field label and visible
description or error content. Explicit `id`, `aria-label`, `aria-labelledby`,
and `aria-describedby` props override this wiring.

Typing a printable character while the trigger is focused opens the listbox and
highlights the first enabled item whose label starts with the typed text.

### Value

Displays the registered text for the selected Item, or the placeholder when no
value is selected. It renders a `span`.

| Prop | Type | Default |
| --- | --- | --- |
| `placeholder` | `ReactNode` | - |

**ARIA:** Value adds no ARIA attributes; Trigger owns the control's name and
value relationship.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-value"` |
| `[data-placeholder]` | Present when no selected label is available |

### Icon

Provides a decorative `span` for a consumer-supplied trigger icon.

| Prop | Type | Default |
| --- | --- | --- |
**Props:** Icon has no Atom-owned behavior props and accepts native `span`
props.

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-icon"` |

### Portal

Moves Content to another container and tells Select that Content is already in
a portal, preventing a second portal wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `disabled` | `boolean` | `false` |

**ARIA:** Portal renders no wrapper and adds no ARIA attributes.

**Data attributes:** Portal renders no wrapper and exposes none.

### Content

Public alias of Listbox that renders and positions the popup option container.
It owns dismissal, initial highlighting, and focus-scope registration.

| Prop | Type | Default |
| --- | --- | --- |
| `disablePortal` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `container` | `HTMLElement \| null` | `document.body` after mount |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"listbox"` |
| `aria-label` | Value from `ariaLabel` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-listbox"` |
| `[data-state]` | `"open"` while rendered |
| `[data-positioned]` | Present after the first positioning frame |

### ScrollUpButton

Renders only while the Viewport can scroll upward. It scrolls the option area
without entering the keyboard focus order.

**Props:** Accepts native button props and children; it has no additional
Atom-owned behavior props.

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-scroll-up-button"` |

### Viewport

Provides the scroll container registered with both scroll buttons. It renders a
`div` and accepts native div props.

**ARIA:** Viewport adds no roles or ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-viewport"` |

### Group

Wraps related Items with `role="group"` and connects them to its Label.

**Props:** Group has no Atom-owned behavior props and accepts native `div`
props.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-labelledby` | Generated Label ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-group"` |

### Label

Names its nearest Group through a generated or consumer-provided ID.

**Props:** Label has no Atom-owned behavior props and accepts native `div`
props, including `id`.

**ARIA:** Label adds no ARIA attributes; Group references its ID.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-label"` |

### Item

Registers one value and text label, owns pointer highlighting and selection,
and returns focus to Trigger after selection.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `disabled` | `boolean` | `false` |
| `label` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"option"` |
| `aria-selected` | `true` when selected |
| `aria-disabled` | `true` when disabled |
| `aria-labelledby` | ItemText ID when ItemText is mounted |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Option value |

### ItemText

Registers the visible option text for Trigger display, typeahead, and Item's
accessible name. It renders a `span`.

**Props:** ItemText has no Atom-owned behavior props and accepts native `span`
props.

**ARIA:** ItemText adds no ARIA attributes; Item references its generated ID.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item-text"` |

### ItemIndicator

Renders a decorative selected marker only for the current Item unless
`forceMount` keeps it mounted for stable composition.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-item-indicator"` |
| `[data-state]` | `"checked" \| "unchecked"` |

### Separator

Renders a horizontal separator between option sections.

**Props:** Separator has no Atom-owned behavior props and accepts native `div`
props.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"separator"` |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-separator"` |

### ScrollDownButton

Renders only while the Viewport can scroll downward. It scrolls the option area
without entering the keyboard focus order.

**Props:** Accepts native button props and children; it has no additional
Atom-owned behavior props.

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-scroll-down-button"` |

### Arrow

Provides a decorative `span` hook for a consumer-drawn popup arrow. Select does
not calculate arrow geometry.

**Props:** Arrow has no Atom-owned behavior props and accepts native `span`
props.

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-arrow"` |

### Listbox

Alternative public name for Content with the same positioned listbox behavior.
Use either `Content` or `Listbox`, not both for the same popup.

| Prop | Type | Default |
| --- | --- | --- |
| `disablePortal` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `container` | `HTMLElement \| null` | `document.body` after mount |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"listbox"` |
| `aria-label` | Value from `ariaLabel` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"select-listbox"` |
| `[data-state]` | `"open"` while rendered |
| `[data-positioned]` | Present after the first positioning frame |

Advanced compound parts can read `useSelectContext`, `useSelectItemContext`,
or `useSelectGroupContext`. Their matching public providers expose the same
contracts for low-level composition.

## Examples

### Form Select

```tsx
import { Field, Select } from "@flowstack-ui/atom";

export default function PlanSelect() {
  return (
    <Field.Root id="plan" required>
      <Field.Label>Plan</Field.Label>
      <Select.Root name="plan" defaultValue="pro">
        <Select.Trigger>
          <Select.Value placeholder="Choose a plan" />
          <Select.Icon>Open</Select.Icon>
        </Select.Trigger>
        <Select.Content>
          <Select.Viewport>
            <Select.Item value="starter">
              <Select.ItemText>Starter</Select.ItemText>
            </Select.Item>
            <Select.Item value="pro">
              <Select.ItemText>Pro</Select.ItemText>
              <Select.ItemIndicator>Selected</Select.ItemIndicator>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </Field.Root>
  );
}
```

### Grouped Options

```tsx
import { Select } from "@flowstack-ui/atom";

export default function GroupedSelect() {
  return (
    <Select.Root>
      <Select.Trigger ariaLabel="Choose a plan">
        <Select.Value placeholder="Choose a plan" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Plans</Select.Label>
          <Select.Item value="team">
            <Select.ItemText>Team</Select.ItemText>
          </Select.Item>
          <Select.Item value="enterprise">
            <Select.ItemText>Enterprise</Select.ItemText>
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
```

## Accessibility

Select follows the
[WAI-ARIA select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/):
a button-based
combobox controls a listbox, and Trigger references the highlighted option with
`aria-activedescendant`. Provide a visible Field label, `ariaLabel`, or native
`aria-labelledby`.
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
