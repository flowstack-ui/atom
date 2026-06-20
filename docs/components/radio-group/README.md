# RadioGroup

Headless single-selection radio group with roving focus.

## Features

- Manages one selected value.
- Can be controlled or uncontrolled.
- Supports horizontal and vertical keyboard navigation.
- Supports optional looping.
- Renders hidden native radio inputs for form submission when named.
- Keeps only the selected or first enabled item in the tab order.

## Import

```tsx
import { RadioGroup } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <RadioGroup.Root>
    <RadioGroup.Item value="one" />
    <RadioGroup.Item value="two" />
  </RadioGroup.Root>
);
```

## API Reference

### Root

Contains radio items and owns the selected value.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"radio-group"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |
| `[data-invalid]` | Present when invalid |

### Item

Renders one radio option in the group.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | Required |
| `disabled` | `boolean` | Group state |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"radio"` |
| `[data-value]` | Item value |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-invalid]` | Present when invalid |

## Examples

### Horizontal Group

```tsx
import { RadioGroup } from "@flowstack-ui/atom";

export default () => (
  <RadioGroup.Root orientation="horizontal" defaultValue="email">
    <RadioGroup.Item value="email">Email</RadioGroup.Item>
    <RadioGroup.Item value="phone">Phone</RadioGroup.Item>
  </RadioGroup.Root>
);
```

## Accessibility

- Root renders `role="radiogroup"`.
- Items render `role="radio"` and own `aria-checked`.
- Arrow keys move focus and selection according to orientation.
- Home and End move to the first and last enabled item.
- Provide a group name with visible text plus `aria-labelledby`, or use
  `ariaLabel`.

## Keyboard Interactions

| Key | Description |
| --- | --- |
| `ArrowDown` | Moves to the next item when orientation is vertical. |
| `ArrowUp` | Moves to the previous item when orientation is vertical. |
| `ArrowRight` | Moves to the next item when orientation is horizontal. |
| `ArrowLeft` | Moves to the previous item when orientation is horizontal. |
| `Home` | Moves to the first enabled item. |
| `End` | Moves to the last enabled item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
