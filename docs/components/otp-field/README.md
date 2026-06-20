# OTPField

One-time password input coordination across multiple visible cells and one hidden form value.

## Features

- Controlled and uncontrolled full value.
- Auto-generated input cells based on `length`.
- Optional explicit input indexes.
- Roving tab stop so the field behaves as one logical control.
- Paste distribution across cells.
- Arrow, Backspace, Delete, Home, and End navigation.
- Numeric, alphabetic, alphanumeric, or custom pattern filtering.
- Hidden input for native form submission.

## Import

```tsx
import { OTPField } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <OTPField.Root>
    <OTPField.Input />
    <OTPField.Separator />
    <OTPField.Input />
  </OTPField.Root>
);
```

## API Reference

### Root

Provides value state and cell coordination.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `length` | `number` | `6` |
| `type` | `"numeric" | "alphabetic" | "alphanumeric" | "text"` | `"numeric"` |
| `pattern` | `RegExp` | Derived from `type` |
| `name` | `string` | - |
| `form` | `string` | - |
| `autoFocus` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `ariaLabel` | `string` | `"Verification code"` |
| `data-slot` | `string` | `"otp-field"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field"` |
| `[data-filled]` | Present when all cells are filled |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Input

Single visible OTP cell.

| Prop | Type | Default |
| --- | --- | --- |
| `index` | `number` | DOM order |
| `aria-label` | `string` | Generated from index and length |
| `data-slot` | `string` | `"otp-field-input"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field-input"` |
| `[data-index]` | Zero-based cell index |
| `[data-filled]` | Present when the cell has a value |
| `[data-active]` | Present when the cell is the roving tab stop |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Separator

Decorative separator between cells.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"otp-field-separator"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"otp-field-separator"` |

## Examples

### Six Digit Code

```tsx
<OTPField.Root name="code" length={6}>
  {Array.from({ length: 6 }).map((_, index) => (
    <OTPField.Input key={index} />
  ))}
</OTPField.Root>
```

### Grouped Code

```tsx
<OTPField.Root length={6}>
  <OTPField.Input />
  <OTPField.Input />
  <OTPField.Input />
  <OTPField.Separator>-</OTPField.Separator>
  <OTPField.Input />
  <OTPField.Input />
  <OTPField.Input />
</OTPField.Root>
```

## Accessibility

The root uses `role="group"` and the visible inputs use roving `tabIndex`, so Tab enters the OTP field once. Arrow keys move between cells.

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
