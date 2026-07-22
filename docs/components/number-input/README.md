# NumberInput

Headless numeric text input with spinbutton semantics.

## When to Use

Use NumberInput when a value is a number and people should be able to type it
or step it up and down with the keyboard, such as quantity or percentage. Use
Input when the text only looks numeric, such as a postal code, account number,
or phone number, because those values should not be incremented or clamped.

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
<NumberInput.Root />
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
| `disabled` | `boolean` | Field state or `false` |
| `readOnly` | `boolean` | Field state or `false` |
| `required` | `boolean` | Field state or `false` |
| `invalid` | `boolean` | Field state or `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `placeholder` | `string` | - |
| `name` | `string` | - |
| `form` | `string` | - |
| `id` | `string` | - |
| `aria-label` | `string` | Field label relationship |
| `aria-valuetext` | `string \| (value: number) => string` | - |
| `aria-describedby` | `string` | Field messages |
| `className` | `string` | - |
| `inputClassName` | `string` | - |
| `children` | `ReactNode \| (state: NumberInputRenderState) => ReactNode` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Native value when provided |
| `aria-valuenow` | Current numeric value when not empty |
| `aria-valuemin` | Value from `min` |
| `aria-valuemax` | Value from `max` |
| `aria-valuetext` | Native string or callback result |
| `aria-describedby` | Native value or inherited Field messages |
| `aria-invalid` | Present when invalid |
| `aria-readonly` | Present when read only |
| `aria-required` | Present when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"number-input"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

When `children` is a function, it receives `numericValue`, `displayValue`,
`isAtMin`, `isAtMax`, `disabled`, `readOnly`, `handleStep`, and `inputRef`.
This supports consumer-owned increment and decrement controls without adding
new styled parts to Atom.

## Examples

### Basic Range

```tsx
import { NumberInput } from "@flowstack-ui/atom";

export function QuantityInput() {
  return <NumberInput.Root aria-label="Quantity" min={0} max={10} step={1} />;
}
```

### Currency Formatting

```tsx
import { NumberInput } from "@flowstack-ui/atom";

export function CurrencyInput() {
  return (
    <NumberInput.Root
      aria-label="Price"
      parser={(value) => value.replace(/[$,]/g, "")}
      formatter={(value) => `$${value}`}
    />
  );
}
```

The package also exports `clampNumberValue`, `formatNumber`, `parseNumber`,
`roundToPrecision`, and `stepNumberValue` for consumers that need the same
numeric calculations outside the rendered component.

## Accessibility

The visible spinbutton owns native required validity; the named hidden input
remains submission-only. A validation attempt is mirrored to Root and the
spinbutton. Inline behavior suppresses only the browser bubble.

NumberInput follows the [WAI-ARIA spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/).
The inner input renders `role="spinbutton"`.
- Atom owns `aria-valuenow`, `aria-valuemin`, `aria-valuemax`,
  `aria-valuetext`, `aria-required`, `aria-readonly`, and `aria-invalid`.
- Provide an accessible name through native ARIA or Field. The visible
  spinbutton participates in external-form validity; the hidden value input
  submits the parsed number. Uncontrolled state resets to `defaultValue`.

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
