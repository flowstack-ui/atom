# Checkbox

Checkbox state with indeterminate support and optional native form
participation.

## When to Use

Use Checkbox for an independent choice that can be checked or unchecked, such
as accepting terms or selecting an item. Use `CheckboxGroup` for several
related choices, `Switch` for an on/off setting that takes effect immediately,
and `Toggle` for a pressed command state such as bold text.

## Features

- Supports checked, unchecked, and indeterminate states.
- Supports controlled and uncontrolled state.
- Supports disabled, read-only, invalid, and required state.
- Renders a hidden native checkbox input for form submission when `name` is
  provided.
- Exposes checkbox state through ARIA and data attributes.
- Supports a decorative Indicator with optional force mounting.
- Supports `asChild` and `render` on both parts.

## Import

```tsx
import { Checkbox } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Checkbox.Root>
  <Checkbox.Indicator />
</Checkbox.Root>
```

## API Reference

### Root

Renders a `button` with checkbox semantics and owns the checked state. Root
also renders an assistive-technology-hidden native checkbox when `name` or
`required` needs native form behavior.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean \| "indeterminate"` | - |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked: CheckboxCheckedState) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `name` | `string` | - |
| `value` | `string` | `"on"` |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"checkbox"` |
| `aria-checked` | `"true" \| "false" \| "mixed"` |
| `aria-label` | Native value when provided |
| `aria-disabled` | `"true"` when disabled |
| `aria-required` | `"true"` when required |
| `aria-invalid` | `"true"` when invalid |
| `aria-readonly` | `"true"` when read-only |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox"` |
| `[data-state]` | `"checked" \| "unchecked" \| "indeterminate"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

The transparent native proxy receives `name`, `value`, `form`, `checked`,
`disabled`, and `required` from Root. It is aligned to the visible Root and
remains eligible for native constraint validation even without `name`;
read-only behavior belongs to the visible semantic Root and does not place a
`readonly` attribute on the proxy. Native validation focus is redirected to
the visible Root. Indeterminate is an ARIA state and
does not submit the hidden input as checked. A disabled Root exposes
`aria-disabled`; the default button also uses the native `disabled` attribute.
Read-only Root remains focusable but does not toggle.

### Indicator

Renders a decorative `span` for the current checked or indeterminate state. It
renders no DOM while unchecked unless `forceMount` is true.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-indicator"` |
| `[data-state]` | `"checked" \| "unchecked" \| "indeterminate"` |
| `[data-disabled]` | Present when Root is disabled |

## Examples

### Indeterminate Selection

```tsx
import { Checkbox } from "@flowstack-ui/atom";

export function SelectAllCheckbox() {
  return (
    <Checkbox.Root
      defaultChecked="indeterminate"
      aria-label="Select all messages"
    >
      <Checkbox.Indicator>Selected</Checkbox.Indicator>
    </Checkbox.Root>
  );
}
```

### Form Submission

```tsx
import { Checkbox } from "@flowstack-ui/atom";

export function TermsCheckbox() {
  return (
    <form>
      <Checkbox.Root name="terms" value="accepted" required>
        <Checkbox.Indicator>Accepted: </Checkbox.Indicator>
        Accept the terms
      </Checkbox.Root>
      <button type="submit">Create account</button>
    </form>
  );
}
```

## Accessibility

An untouched required Checkbox remains visually neutral. Leaving it unchecked
after focus, removing its checked state after interaction, or attempting
validation mirrors proxy invalidity to the visible Root and its Field.
Correction clears the derived invalid state immediately, and form reset returns
it to untouched. Inline behavior suppresses the browser bubble and uses Field
Error when available; native behavior keeps the aligned browser UI. When inline
validation redirects focus to Root, it explicitly scrolls Root into view and
keeps `[data-focus-visible]` present until blur so a styled layer can expose the
focus move.

Checkbox follows the
[WAI-ARIA Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).
Root exposes `role="checkbox"` and its state through `aria-checked`; the
indeterminate state is announced as `mixed`. Provide an accessible name through
visible text, native `aria-label`, or `aria-labelledby`. Inside `Field.Root`,
Checkbox inherits the control ID, state, and description relationships unless
an explicit control prop overrides that state. Uncontrolled checked state
returns to `defaultChecked` on native form reset.

Indicator is decorative and hidden from assistive technology because Root
already communicates the state. Disabled Root is removed from interaction;
read-only Root remains focusable so its value can still be inspected.

| Key | Description |
| --- | --- |
| `Space` | Toggles checked state unless disabled or read-only. |
| `Enter` | Toggles checked state unless disabled or read-only. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
