# OTPField

One-time password input coordination across multiple visible cells and one hidden form value.

## When to Use

Use OTPField for a short verification code that is entered one character at a
time and may be pasted from a message. Use PasswordToggleField for a reusable
secret chosen by the person, and Input when the value belongs in one normal
text box instead of visually separated cells.

## Features

- Controlled and uncontrolled full value.
- Coordinates rendered input cells and assigns indexes from their render order.
- Optional explicit input indexes.
- Roving tab stop so the field behaves as one logical control.
- Paste distribution across cells.
- Arrow, Backspace, Delete, Home, and End navigation.
- Numeric, alphabetic, alphanumeric, or custom pattern filtering.
- Hidden input for native form submission.
- Optional masking, completion callback, auto-focus, and form submission.

## Import

```tsx
import { OTPField } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<OTPField.Root>
  <OTPField.Input />
  <OTPField.Separator />
  <OTPField.Input />
</OTPField.Root>
```

## API Reference

### Root

Owns the complete code value, filtering, cell registration, focus movement,
Field state, completion behavior, and optional hidden form input.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `onComplete` | `(value: string) => void` | - |
| `length` | `number` | `6` |
| `type` | `"numeric" \| "alphabetic" \| "alphanumeric"` | `"numeric"` |
| `pattern` | `RegExp` | Derived from `type` |
| `mask` | `boolean \| string` | `false` |
| `name` | `string` | - |
| `form` | `string` | - |
| `inputId` | `string` | Generated or inherited from Field |
| `autoFocus` | `boolean` | `false` |
| `autoSubmit` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `ariaLabel` | `string` | `"Verification code"` |
| `ariaDescribedBy` | `string` | Field description IDs |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel`, or `"Verification code"` without an external label |
| `aria-labelledby` | Inherited Field label ID when no direct label is provided |
| `aria-describedby` | Value from `ariaDescribedBy` or Field descriptions |
| `aria-invalid` | Present when invalid |
| `aria-required` | Present when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Input

Renders one visible character cell, joins the roving tab stop, and delegates
typing, paste, deletion, and focus movement to `Root`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `index` | `number` | DOM order |
| `aria-label` | `string` | Generated from index and length |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Digit N of length"` or `"Character N of length"` by default |
| `aria-invalid` | Present when the root is invalid |
| `aria-required` | Present when the root is required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field-input"` |
| `[data-index]` | Zero-based cell index |
| `[data-filled]` | Present when the cell has a value |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Separator

Decorative separator between cells.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `index` | `number` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field-separator"` |
| `[data-index]` | Value from `index` when provided |

The package exports `useOTPFieldContext` and its provider for advanced compound
parts. It also exports `getOTPFieldPattern`, `isOTPFieldCharAccepted`,
`getOTPFieldChars`, `filterOTPFieldValue`, and `getOTPFieldDisplayChar` for
using the same filtering and display rules outside the rendered field.

## Examples

### Six Digit Code

```tsx
import { OTPField } from "@flowstack-ui/atom";

export function VerificationCode() {
  return (
    <OTPField.Root name="code" length={6}>
      {Array.from({ length: 6 }, (_, index) => (
        <OTPField.Input key={index} />
      ))}
    </OTPField.Root>
  );
}
```

### Grouped Code

```tsx
import { OTPField } from "@flowstack-ui/atom";

export function GroupedCode() {
  return (
    <OTPField.Root length={6} onComplete={(code) => console.log(code)}>
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Separator>-</OTPField.Separator>
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Input />
    </OTPField.Root>
  );
}
```

## Accessibility

The root uses `role="group"` and the visible inputs use roving `tabIndex`, so
Tab enters the OTP field once. Each input receives a generated position label,
and the separator is hidden from assistive technology. Give the group a clear
label through `ariaLabel`, native labeling, or Field.

| Key | Description |
| --- | --- |
| `Tab` | Enters or leaves the OTP field as one logical control. |
| `ArrowRight` | Moves to the next cell. |
| `ArrowLeft` | Moves to the previous cell. |
| `Home` | Moves to the first cell. |
| `End` | Moves to the last cell. |
| `Backspace` | Clears the current cell or moves backward when empty. |
| `Delete` | Clears the current cell. |
| `Paste` | Distributes accepted characters across cells. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
