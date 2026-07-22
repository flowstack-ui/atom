# CheckboxGroup

Headless primitives for managing a named set of independent checkbox choices.

## When to Use

Use CheckboxGroup when a person may choose any number of related options, such
as several notification methods. Use Checkbox for one yes-or-no choice. Use
RadioGroup when exactly one option may be selected, and ToggleGroup for a group
of pressed controls rather than form choices. When a visible legend is
important, consider native `fieldset` and `legend` around the group.

## Features

- Supports controlled and uncontrolled arrays of selected values.
- Shares disabled, required, read-only, invalid, name, and form state.
- Allows each Item to override shared state where supported.
- Provides deterministic Parent/select-all state from an explicit complete
  value set.
- Provides structured ItemLabel and ItemDescription relationships while
  preserving plain Item children.
- Creates a hidden checkbox input per named Item for form submission.
- Supports vertical and horizontal metadata without imposing layout.
- Preserves native button props and custom composition.

## Import

```tsx
import { CheckboxGroup } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<CheckboxGroup.Root>
  <CheckboxGroup.Parent />
  <CheckboxGroup.Item>
    <CheckboxGroup.ItemLabel />
    <CheckboxGroup.ItemDescription />
  </CheckboxGroup.Item>
</CheckboxGroup.Root>
```

## API Reference

### Root

Owns the selected values and the state shared by every Item. It renders a
`div` with group semantics but does not add a visible label.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string[]` | - |
| `defaultValue` | `string[]` | `[]` |
| `onValueChange` | `(value: string[]) => void` | - |
| `allValues` | `string[]` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Fieldset/Form value or `"native"` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-label` | Native value when provided |
| `aria-labelledby` | Native value or inherited Fieldset Legend ID |
| `aria-describedby` | Native value or inherited Fieldset messages |
| `aria-readonly` | `"true"` when read only |
| `aria-invalid` | `"true"` when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-group"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |
| `[data-required]` | Present when required |

`allValues` is the explicit complete selectable value set used by Parent. It
is optional for groups without Parent. Duplicate values are normalized in
first-occurrence order. Omit an individually disabled Item's value while it is
disabled so Parent controls only currently selectable Items; selected values
outside the declared set are preserved.

### Item

Represents one independent choice. It renders a checkbox button and, when a
name is available, a visually hidden native checkbox carrying its value for
form submission.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `name` | `string` | Root `name` |
| `form` | `string` | Root `form` |
| `disabled` | `boolean` | Root state |
| `required` | `boolean` | Root state |
| `readOnly` | `boolean` | Root state |
| `invalid` | `boolean` | Root state |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"checkbox"` |
| `aria-checked` | Current checked state |
| `aria-label` | Native value when provided |
| `aria-disabled` | `"true"` when disabled |
| `aria-required` | `"true"` when required |
| `aria-readonly` | `"true"` when read only |
| `aria-invalid` | `"true"` when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-group-item"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-value]` | Item value |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

Each item input is `aria-hidden`, removed from the tab order, and receives
`name`, `value`, `form`, checked, and disabled state. `required` adds one
group-level native validity control that remains eligible for constraint
validation, so at least one item—not every item—must be checked. The proxy is
aligned with the first enabled item and redirects browser validation focus to
that visible checkbox. Read-only
behavior belongs to the visible semantic controls and does not bar the hidden
inputs from validation. Root does not emit `aria-required` because ARIA does
not permit that property on `role="group"`; required state remains exposed on
the checkbox items, through `[data-required]`, and through native form validity.

Plain Item children provide the accessible name from button content. For a
structured choice, nest ItemLabel and ItemDescription. Item then receives
stable `aria-labelledby` and `aria-describedby` relationships in server markup
and after hydration. Explicit native ARIA props take precedence.

### ItemLabel

Renders a `span` that provides the structured accessible name for its Item.
It supports native span props, ref, `asChild`, and `render`, and exposes
`data-slot="checkbox-group-item-label"`. Its relationship ID is owned by Item
so it always matches Item's generated `aria-labelledby` value.

### ItemDescription

Renders a `span` that provides additional described-by content for its Item.
It supports native span props, ref, `asChild`, and `render`, and exposes
`data-slot="checkbox-group-item-description"`. Its relationship ID is owned by
Item so it always matches Item's generated `aria-describedby` value.

### Parent

Renders an aggregate checkbox button. Parent requires `allValues` on Root so
its checked, mixed, and unchecked state is correct during server rendering.
Activating an unchecked or mixed Parent selects every declared value;
activating a checked Parent clears the declared values. Selected values outside
the declared set are preserved.

Parent inherits group disabled, read-only, and invalid state. It does not
render a named input and never contributes its own form value. Compose
`Checkbox.Indicator` inside it when a visual layer needs state content. Parent
accepts Checkbox Root's native button, ref, `asChild`, and `render` surface
except controlled state and form-value props, which are group-owned. It exposes
`data-slot="checkbox-group-parent"` and the normal Checkbox state attributes.

## Examples

### Notification Methods

```tsx
import { CheckboxGroup } from "@flowstack-ui/atom";

export function NotificationMethods() {
  return (
    <CheckboxGroup.Root
      name="notifications"
      defaultValue={["email"]}
      aria-label="Notification methods"
    >
      <CheckboxGroup.Item value="email">Email</CheckboxGroup.Item>
      <CheckboxGroup.Item value="sms">Text message</CheckboxGroup.Item>
      <CheckboxGroup.Item value="push">Push notification</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  );
}
```

### Select All and Structured Items

```tsx
import { Checkbox, CheckboxGroup } from "@flowstack-ui/atom";

const methods = ["email", "sms", "push"];

export function CompleteNotificationMethods() {
  return (
    <CheckboxGroup.Root
      allValues={methods}
      defaultValue={["email"]}
      name="notifications"
      aria-label="Notification methods"
    >
      <CheckboxGroup.Parent>
        <Checkbox.Indicator />
        Select all
      </CheckboxGroup.Parent>
      <CheckboxGroup.Item value="email">
        <Checkbox.Indicator />
        <CheckboxGroup.ItemLabel>Email</CheckboxGroup.ItemLabel>
        <CheckboxGroup.ItemDescription>
          Recommended for account notices.
        </CheckboxGroup.ItemDescription>
      </CheckboxGroup.Item>
      <CheckboxGroup.Item value="sms">Text message</CheckboxGroup.Item>
      <CheckboxGroup.Item value="push">Push notification</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  );
}
```

### Controlled Choices

```tsx
import { useState } from "react";
import { CheckboxGroup } from "@flowstack-ui/atom";

export function ControlledTopics() {
  const [topics, setTopics] = useState<string[]>(["product"]);

  return (
    <CheckboxGroup.Root
      value={topics}
      onValueChange={setTopics}
      aria-label="Email topics"
    >
      <CheckboxGroup.Item value="product">Product news</CheckboxGroup.Item>
      <CheckboxGroup.Item value="events">Events</CheckboxGroup.Item>
      <CheckboxGroup.Item value="research">Research</CheckboxGroup.Item>
    </CheckboxGroup.Root>
  );
}
```

## Accessibility

Required validity means at least one item, never that the first item must be
selected. An untouched empty group remains visually neutral. Leaving the whole
group empty, removing its last selection after interaction, or attempting
validation marks Root and Fieldset invalid. Moving focus between Items does not
count as leaving the group. Correction clears the derived invalid state, form
reset returns it to untouched, and a validation attempt focuses the first
enabled Item and explicitly scrolls it into view. That Item exposes
`[data-focus-visible]` until blur so a styled layer can expose
validation-directed focus. Inline behavior reveals Fieldset
Error and suppresses the proxy's option-like browser message; native behavior
keeps browser UI by explicit request.

Root names and groups the choices, while each Item follows the
[WAI-ARIA Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).
Provide a concise group name with native `aria-label`/`aria-labelledby`, or
nest the group under Fieldset so its Legend and messages are inherited.
Disabled and read-only items cannot change value.

Parent follows the APG mixed-checkbox model. Structured Item parts keep the
visible name and supporting description separately addressable. Plain Item
children remain appropriate for concise options.

| Key | Description |
| --- | --- |
| `Space` | Toggles the focused Item. |
| `Enter` | Toggles the focused Item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
