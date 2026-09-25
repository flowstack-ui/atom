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
- Provides Input, Increment, and Decrement parts for compound control layouts.

## Import

```tsx
import { NumberInput } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<NumberInput.Root>
  <NumberInput.Decrement />
  <NumberInput.Input />
  <NumberInput.Increment />
</NumberInput.Root>
```

## API Reference

### Localized editing and controller composition

Numeric mode remains the default: `value` is a number or null and
`onValueChange` receives a number or null. With `valueMode="string"`, values
are strings and the callback receives `{ value, valueAsNumber }`. Empty or
unparseable editing text produces `NaN` in those details, but never submits
`NaN`: the hidden field submits an empty value instead.

Use `locale` (default `en-US`) and `formatOptions` for localized decimal,
currency or percent display and parsing. Do not combine `formatOptions` with
custom `parser`/`formatter` callbacks. Named inputs always submit the parsed
numeric value, not a localized string.

`useNumberInput(options)` exposes the shared controller. Supply it to
`NumberInput.RootProvider` instead of Root; the provider accepts native host
props and composition props, not another set of behavior options.
`Label` associates with the Input, `ValueText` projects the editing text, and
`Context` renders a callback without adding an element. `Scrubber` adds a
horizontal pointer stepping target (mirrored in RTL); retain Input for keyboard
access. Explicit `ids` can identify the root, input, label, step buttons and
scrubber. `translations` supplies step labels and value text.

Scrubber exposes `[data-scrubbing]` only during an active pointer session.
Styled consumers can use it to preserve drag cursor feedback beyond the host.
Release, cancellation, capture loss, window blur, document visibility loss,
Escape, disabled/read-only changes and unmount end the session. Atom does not
inject cursor artwork, styles, or pointer lock. Keep typed keyboard entry available.

Shift+Arrow uses `largeStep`, Alt+Arrow uses `smallStep` (default `step / 10`).
Enter and blur commit and normalize according to `clampOnBlur`; Enter does
not prevent native form submission. `onValueCommit`, `onFocusChange` and
`onValueInvalid` expose commit, focus and range details. `allowOverflow`
defaults to true while editing; false clamps range excursions immediately.
`allowMouseWheel` defaults to false and only consumes wheel events when the
Input is focused. `spinOnPress` defaults to true. `focusInputOnChange` defaults
to true for stepping. `inputMode` defaults to decimal and `pattern` is optional.

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
This preserves the legacy render-callback path for custom controls.

When Root has no children or uses the legacy render callback, it renders its
Input automatically. Static children opt into compound anatomy and should
include exactly one Input.

### Input

Renders the editable spinbutton. Native input props, `render`, `asChild`, and a
native input ref are supported. Root owns value, limits, form state, and the
generated Field relationships.

### Increment and Decrement

Render native buttons that call Root's step behavior, preserve input focus on
pointer activation, reference the Input with `aria-controls`, and expose
`aria-disabled` plus `[data-boundary]` at a known limit. They default to
`tabIndex={-1}` while remaining available to pointer, touch, and voice access.
Provide localized action labels when the English `Increment` and `Decrement`
defaults are not appropriate.

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
