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

Renders a `button` with checkbox semantics and owns the checked state. When
`name` is provided, Root also renders an assistive-technology-hidden native
checkbox input for form submission.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean \| "indeterminate"` | - |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked: CheckboxCheckedState) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `name` | `string` | - |
| `value` | `string` | `"on"` |
| `form` | `string` | - |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"checkbox"` |
| `aria-checked` | `"true" \| "false" \| "mixed"` |
| `aria-label` | Value from `ariaLabel` when provided |
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

The hidden input receives `name`, `value`, `form`, `checked`, `disabled`, and
`required` from Root. Indeterminate is an ARIA state and does not submit the
hidden input as checked. A disabled default Root uses the native `disabled`
attribute; read-only Root remains focusable but does not toggle.

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
      ariaLabel="Select all messages"
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

Checkbox follows the
[WAI-ARIA Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).
Root exposes `role="checkbox"` and its state through `aria-checked`; the
indeterminate state is announced as `mixed`. Provide an accessible name through
visible text, `ariaLabel`, or `aria-labelledby`.

Indicator is decorative and hidden from assistive technology because Root
already communicates the state. Disabled Root is removed from interaction;
read-only Root remains focusable so its value can still be inspected.

| Key | Description |
| --- | --- |
| `Space` | Toggles checked state unless disabled or read-only. |
| `Enter` | Toggles checked state unless disabled or read-only. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
