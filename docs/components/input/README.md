# Input

Native text input behavior with controlled value state, Field integration, and
an optional clear control.

## Features

- Renders a native `<input>`.
- Supports controlled and uncontrolled value.
- Integrates with `Field.Root` for IDs, descriptions, errors, and state.
- Exposes filled, focused, disabled, readonly, and invalid state.
- Includes an optional clear button that clears and refocuses the input.
- Preserves native input props and event handlers.

## Import

```tsx
import { Input } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Input.Root>
    <Input.Clear />
  </Input.Root>
);
```

## API Reference

### Root

Renders the native input element and provides context to `Input.Clear`.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `disabled` | `boolean` | Field context or `false` |
| `required` | `boolean` | Field context or `false` |
| `readOnly` | `boolean` | Field context or `false` |
| `invalid` | `boolean` | Field context or `false` |
| `id` | `string` | Field control ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"input"` |
| `[data-filled]` | Present when value is not empty |
| `[data-focused]` | Present when focused |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Clear

Clears the current input value and refocuses the input.

| Prop | Type | Default |
| --- | --- | --- |
| `onClear` | `() => void` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `children` | `ReactNode` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"input-clear"` |
| `[data-disabled]` | Present when clear is unavailable |
| `[data-hidden]` | Present when value is empty, disabled, or read-only |

## Examples

### With Field

```tsx
import { Field, Input } from "@flowstack-ui/atom";

export default () => (
  <Field.Root id="email" required>
    <Field.Label>Email</Field.Label>
    <Input.Root name="email" type="email" />
    <Field.Description>Use a work email.</Field.Description>
    <Field.Error>Email is required.</Field.Error>
  </Field.Root>
);
```

### Clear Button

```tsx
import { Input } from "@flowstack-ui/atom";

export default () => (
  <Input.Root defaultValue="Search text">
    <Input.Clear>Clear</Input.Clear>
  </Input.Root>
);
```

## Accessibility

- Uses native input semantics.
- Provide a visible label or accessible name.
- When used inside `Field.Root`, `aria-describedby` is wired to visible
  description and error content.
- `Input.Clear` defaults to `aria-label="Clear input"` and is removed from the
  tab order when it cannot clear.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
