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
  <CheckboxGroup.Item />
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
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-label` | Native value when provided |
| `aria-labelledby` | Native value or inherited Fieldset Legend ID |
| `aria-describedby` | Native value or inherited Fieldset messages |
| `aria-required` | `"true"` when required |
| `aria-readonly` | `"true"` when read only |
| `aria-invalid` | `"true"` when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-group"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

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
`name`, `value`, `form`, checked, disabled, and read-only state. `required`
adds one group-level native validity control, so at least one item—not every
item—must be checked.

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

Root names and groups the choices, while each Item follows the
[WAI-ARIA Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).
Provide a concise group name with native `aria-label`/`aria-labelledby`, or
nest the group under Fieldset so its Legend and messages are inherited.
Disabled and read-only items cannot change value.

| Key | Description |
| --- | --- |
| `Space` | Toggles the focused Item. |
| `Enter` | Toggles the focused Item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
