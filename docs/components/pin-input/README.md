# PinInput

Short PIN and verification-code coordination across character cells and one
automatic hidden form value. OTP autocomplete is opt-in, not the default.

## When to Use

Use PinInput for a fixed-length PIN or verification code entered one character
at a time. Set `otp` for a one-time code received from a message. Use
PasswordToggleField for an unrestricted password, and Input when the value
belongs in one text box rather than separated cells. Masking does not perform
verification, expiry, secure storage or credential acquisition.

## Features

- Controlled and uncontrolled arrays preserve empty positions and leading zeros.
- Coordinates rendered input cells and assigns indexes from their render order.
- Optional explicit input indexes.
- Roving tab stop so the field behaves as one logical control.
- Paste distribution across cells.
- Arrow, Backspace, Delete, Home, and End navigation.
- Numeric, alphabetic, alphanumeric, or custom per-character validation.
- Atomic paste/autofill validation, sanitization and rejection notifications.
- Controller, render-prop Context, Label and Control composition.
- Hidden input for native form submission.
- Optional masking, completion callback, auto-focus, and form submission.

## Import

```tsx
import { PinInput } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<PinInput.Root length={2} aria-label="PIN">
  <PinInput.Input />
  <PinInput.Separator />
  <PinInput.Input />
</PinInput.Root>
```

## API Reference

### Root

Owns the complete code value, filtering, cell registration, focus movement,
Field state, completion behavior, and optional hidden form input.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string[]` | - |
| `defaultValue` | `string[]` | Empty cells |
| `onValueChange` | `({ value, valueAsString, complete }) => void` | - |
| `onComplete` | `(value: string) => void` | - |
| `length` | `number` | `6` |
| `type` | `"numeric" \| "alphabetic" \| "alphanumeric"` | `"numeric"` |
| `pattern` | `RegExp` | Derived from `type` |
| `mask` | `boolean \| string` | `false` |
| `otp` | `boolean` | `false` |
| `placeholder` | `string` | `"○"` |
| `selectOnFocus` | `boolean` | `true` |
| `blurOnComplete` | `boolean` | `false` |
| `sanitizeValue` | `(value: string) => string` | Trim outer whitespace |
| `onValueInvalid` | `({ value, index, reason }) => void` | - |
| `translations` | `{ label?: string; required?: string }` | English group/required messages |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `name` | `string` | - |
| `form` | `string` | - |
| `inputId` | `string` | Generated or inherited from Field |
| `getInputLabel` | `(index, length, type) => string` | Generated English position label |
| `autoFocus` | `boolean` | `false` |
| `autoSubmit` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Native value, or `"Code"` without an external label |
| `aria-labelledby` | Inherited Field label ID when no direct label is provided |
| `aria-describedby` | Native value or Field descriptions |
| `aria-invalid` | Present when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pin-input"` |
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
| `[data-slot]` | `"pin-input-input"` |
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
| `[data-slot]` | `"pin-input-separator"` |
| `[data-index]` | Value from `index` when provided |

### Controller and parts

`usePinInput(options)` accepts the Root behavior options. Pass its result to
`RootProvider value={controller}`. `Context` takes a render function and
`usePinInputContext()` reads the same public controller. Create the controller
inside its Field/Form/Direction providers so inherited options are available.

The controller exposes `value: string[]`, `valueAsString`, `complete`,
`focusedIndex` (-1 when blurred), `setValue(string[])`,
`setValueAtIndex(index, character)`, `clearValue()`, `focus(index?)`, and `blur()`.
Disabled/readOnly fields reject mutations. Render exactly `length` cells.
RootProvider retains Root's native div, ref and asChild/render contract; its
value must be created by `usePinInput`, not a hand-authored object.

`Label` is a native label associated with the first cell and names the group.
`Control` is a native div for the cell row. Both accept native props and refs.
Their owner-generated label ID and data slots remain fixed. Separator is
decorative, not a focus target. Root/RootProvider automatically render the one
named hidden input; do not add another named proxy.

The package also exports `getPinInputPattern`, `isPinInputCharAccepted`,
`getPinInputChars(string[], length)`, `filterPinInputValue`, and
`getPinInputDisplayChar`. The latter two are low-level filtering/visual helpers,
not the input acceptance pipeline: rendered paste rejects an entire invalid
candidate, and `mask={true}` uses a real password input instead of replacing
its DOM value with bullets. A custom mask string is visual-only.

## Examples

### Six Digit Code

```tsx
import { PinInput } from "@flowstack-ui/atom";

export function VerificationCode() {
  return (
    <PinInput.Root name="code" length={6} otp>
      {Array.from({ length: 6 }, (_, index) => (
        <PinInput.Input key={index} />
      ))}
    </PinInput.Root>
  );
}
```

### Grouped Code

```tsx
import { PinInput } from "@flowstack-ui/atom";

export function GroupedCode() {
  return (
    <PinInput.Root length={6} onComplete={(code) => console.log(code)}>
      <PinInput.Input />
      <PinInput.Input />
      <PinInput.Input />
      <PinInput.Separator>-</PinInput.Separator>
      <PinInput.Input />
      <PinInput.Input />
      <PinInput.Input />
    </PinInput.Root>
  );
}
```

## Accessibility

The first visible cell owns required completeness validity for the entire code; the
combined named input remains submission-only. A validation attempt is mirrored
across Root and every cell. Inline behavior suppresses the browser bubble.

The root uses `role="group"` and the visible inputs use roving `tabIndex`, so
Tab enters the OTP field once. Each input receives a generated position label,
and the separator is hidden from assistive technology. The group does not carry
`aria-required`, because that attribute is unsupported on `role="group"`. Give the group a clear
label through native `aria-label`/`aria-labelledby` or Field. The first visible
cell owns required validity and anchors native browser feedback. The combined
hidden native input is submission-only;
uncontrolled content resets to `defaultValue`.

Use `getInputLabel` to localize every generated cell position label. A direct
`aria-label` on an Input still overrides the generated label for that cell.

| Key | Description |
| --- | --- |
| `Tab` | Enters or leaves the OTP field as one logical control. |
| `ArrowRight` | Moves to the next cell in LTR, previous in RTL. |
| `ArrowLeft` | Moves to the previous cell in LTR, next in RTL. |
| `Home` | Moves to the first cell. |
| `End` | Moves to the last cell. |
| `Backspace` | Clears the current cell or moves backward when empty. |
| `Delete` | Clears the current cell. |
| `Paste` | Sanitizes and validates all characters, then replaces from the first cell. |

## Value and completion contract

Never rebuild controlled arrays from `valueAsString`: joining loses holes.
Use `onValueChange={({ value }) => setValue(value)}`. Required validity checks
every cell. Without `required`, incomplete values are permitted and the named
wire value is the joined characters; applications needing positional partial
data should use the controller array instead of FormData.

Typing replaces the current cell even with selection disabled. Empty native
input events clear that position without shifting later cells. Composition
drafts do not move focus until committed. Default character types are ASCII;
use a per-character RegExp for other alphabets. Global/sticky RegExp state is
reset. Invalid typing/paste/controller writes report `invalidCharacter` without
mutating the value. Valid overlong paste is truncated to `length`; invalid
characters anywhere in that paste reject it before truncation. Finite length is
floored and clamped to one; nonfinite values fall back to six.

`onComplete` fires once for a changed accepted complete transaction after React
commits. Initial/default values and external controlled replacements do not
complete. A parent refusing a controlled change cannot submit. `autoSubmit`
uses native requestSubmit after hidden value and validity updates; it is an
explicit product action. Uncontrolled native reset restores the initial value
even without a name, supports external `form`, and respects prevented reset.

## Migration from OTPField

This owner replaces the OTPField export/subpath directly; there is no alias.
Import `PinInput` from `@flowstack-ui/atom/pin-input`. Change string state to
arrays, adapt change callbacks to details, and explicitly add `otp` to existing
one-time-code consumers. Keep `onComplete(code: string)` at the complete-value
boundary. This is an unreleased breaking migration, not a change to previously
published OTPField artifacts.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
