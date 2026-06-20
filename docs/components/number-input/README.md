# NumberInput

Headless numeric text input with spinbutton semantics.

## Features

- Renders an editable text input with `role="spinbutton"`.
- Can be controlled or uncontrolled.
- Supports `min`, `max`, `step`, `largeStep`, and precision formatting.
- Supports keyboard stepping with arrows, Page Up/Down, Home, and End.
- Supports custom parser and formatter functions.
- Renders a hidden input for native form submission when named.

## Import

```tsx
import { NumberInput } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <NumberInput.Root />
);
```

## API Reference

### Root

Renders the root container, inner spinbutton input, and optional hidden form
input.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number \| null` | - |
| `defaultValue` | `number` | - |
| `onValueChange` | `(value: number \| null) => void` | - |
| `min` | `number` | - |
| `max` | `number` | - |
| `step` | `number` | `1` |
| `largeStep` | `number` | `step * 10` |
| `precision` | `number` | Inferred from step |
| `clampOnBlur` | `boolean` | `true` |
| `formatter` | `(value: string) => string` | - |
| `parser` | `(displayValue: string) => string` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `name` | `string` | - |
| `form` | `string` | - |
| `ariaLabel` | `string` | - |
| `ariaValueText` | `(value: number) => string` | - |
| `ariaDescribedBy` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"number-input"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

## Examples

### Basic Range

```tsx
import { NumberInput } from "@flowstack-ui/atom";

export default () => (
  <NumberInput.Root ariaLabel="Quantity" min={0} max={10} step={1} />
);
```

### Currency Formatting

```tsx
import { NumberInput } from "@flowstack-ui/atom";

export default () => (
  <NumberInput.Root
    ariaLabel="Price"
    parser={(value) => value.replace(/[$,]/g, "")}
    formatter={(value) => `$${value}`}
  />
);
```

## Accessibility

- Inner input renders `role="spinbutton"`.
- Atom owns `aria-valuenow`, `aria-valuemin`, `aria-valuemax`,
  `aria-valuetext`, `aria-required`, `aria-readonly`, and `aria-invalid`.
- Provide an accessible name through `ariaLabel` or external labeling.

## Keyboard Interactions

| Key | Description |
| --- | --- |
| `ArrowUp` | Increments by `step`. |
| `ArrowDown` | Decrements by `step`. |
| `PageUp` | Increments by `largeStep`. |
| `PageDown` | Decrements by `largeStep`. |
| `Home` | Moves to `min` when provided. |
| `End` | Moves to `max` when provided. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
