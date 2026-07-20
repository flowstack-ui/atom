# Input

Native single-line input primitive with controlled value state, Field wiring,
and an optional clear control.

## When to Use

Use Input for one line of text such as a name, email, or search query. Use
Textarea for multi-line text and NumberInput when numeric stepping and numeric
keyboard behavior are required. Wrap Input in Field when it needs a generated
label, description, error, or shared validation state.

## Features

- Supports controlled and uncontrolled string values.
- Preserves native input types, attributes, and event handlers.
- Inherits IDs, descriptions, and state from Field unless locally overridden.
- Exposes filled, focused, disabled, required, read-only, and invalid state.
- Includes a Clear control that clears and refocuses Root.
- Exposes state and actions through `useInputContext`.

## Import

```tsx
import { Input } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Input.Root>
  <Input.Clear />
</Input.Root>

useInputContext()
```

## API Reference

### Root

Renders a native `input` followed by its compound children, without adding a
wrapper element. Local state props override Field context.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `disabled` | `boolean` | Field state or `false` |
| `required` | `boolean` | Field state or `false` |
| `readOnly` | `boolean` | Field state or `false` |
| `invalid` | `boolean` | Field state or `false` |

Native input props, including `type`, `name`, `form`, `onChange`, and explicit
ARIA relationships, pass through. Uncontrolled values return to `defaultValue`
on native form reset.

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Explicit value or mounted Field Description/Error IDs |
| `aria-invalid` | `"true"` when invalid |
| `aria-readonly` | `"true"` when read only |
| `aria-required` | `"true"` when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"input"` |
| `[data-filled]` | Present when value is not empty |
| `[data-focused]` | Present while focused |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

### Clear

Renders a button that clears Root, calls `onClear`, and restores focus. It is
always removed from sequential tab order and becomes hidden and disabled when
Root is empty, disabled, or read-only.

| Prop | Type | Default |
| --- | --- | --- |
| `onClear` | `() => void` | - |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Consumer value or `"Clear input"` |
| `aria-hidden` | `"true"` while unavailable |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"input-clear"` |
| `[data-disabled]` | Present when Root is disabled or read-only |
| `[data-hidden]` | Present while unavailable |

### useInputContext

Returns the current value, state, input ref, `setValue`, and `clearValue` for
advanced custom parts. It must be used below Root.

## Examples

### Field-Wired Email

```tsx
import { Field, Input } from "@flowstack-ui/atom";

export function EmailField() {
  return (
    <Field.Root id="email" required>
      <Field.Label>Email</Field.Label>
      <Input.Root name="email" type="email" />
      <Field.Description>Use a work email address.</Field.Description>
    </Field.Root>
  );
}
```

### Clearable Search

```tsx
import { useState } from "react";
import { Input } from "@flowstack-ui/atom";

export function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <label>
      Search
      <Input.Root value={query} onValueChange={setQuery} type="search">
        <Input.Clear>Clear search</Input.Clear>
      </Input.Root>
    </label>
  );
}
```

## Accessibility

Root uses native input semantics. Give it an accessible name with a native
label, Field.Label, `aria-label`, or `aria-labelledby`. Clear has an accessible
default label but is intentionally outside the Tab sequence; pointer users can
activate it, while keyboard users can select and delete the input value with
normal editing keys.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
