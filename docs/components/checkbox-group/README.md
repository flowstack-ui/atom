# CheckboxGroup

Headless multi-selection state for grouped checkboxes.

## Features

- Manages an array of selected values.
- Can be controlled or uncontrolled.
- Shares disabled, read-only, required, invalid, name, and form state with items.
- Each item can render a hidden checkbox input for native form submission.
- Exposes orientation and item state through data attributes.

## Import

```tsx
import { CheckboxGroup } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <CheckboxGroup.Root>
    <CheckboxGroup.Item value="one" />
    <CheckboxGroup.Item value="two" />
  </CheckboxGroup.Root>
);
```

## API Reference

### Root

Contains checkbox items and owns the selected value array.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string[]` | - |
| `defaultValue` | `string[]` | `[]` |
| `onValueChange` | `(values: string[]) => void` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-group"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Item

Renders one checkbox option in the group.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `disabled` | `boolean` | Group state |
| `readOnly` | `boolean` | Group state |
| `invalid` | `boolean` | Group state |
| `required` | `boolean` | Group state |
| `name` | `string` | Group `name` |
| `form` | `string` | Group `form` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-group-item"` |
| `[data-value]` | Item value |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

## Examples

### Controlled Selection

```tsx
import { CheckboxGroup } from "@flowstack-ui/atom";

export default () => (
  <CheckboxGroup.Root value={selected} onValueChange={setSelected}>
    <CheckboxGroup.Item value="email">Email</CheckboxGroup.Item>
    <CheckboxGroup.Item value="sms">SMS</CheckboxGroup.Item>
  </CheckboxGroup.Root>
);
```

## Accessibility

- Root renders `role="group"`.
- Items render `role="checkbox"` and own `aria-checked`.
- Provide a group name with visible text plus `aria-labelledby`, or use
  `ariaLabel`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
