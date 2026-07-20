# Textarea

Native textarea behavior with controlled value state, Field integration,
optional auto-resize, and a count display.

## When to Use

Use `Textarea` when people need to enter several lines of free-form text, such
as a message or description. Use `Input` for a short single-line value and a
purpose-built control when the answer has a fixed format.

## Features

- Renders a native `<textarea>`.
- Supports controlled and uncontrolled value.
- Integrates with `Field.Root` for IDs, descriptions, errors, and state.
- Supports optional auto-resize with `minRows` and `maxRows`.
- Includes an optional character count part.
- Exposes filled, focused, disabled, readonly, invalid, and over-limit state.

## Import

```tsx
import { Textarea } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Textarea.Root>
  <Textarea.Count />
</Textarea.Root>
```

## API Reference

### Root

Renders the native textarea element and provides context to `Textarea.Count`.
Field state is inherited unless the corresponding prop is set directly.
Uncontrolled values return to `defaultValue` on native form reset.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `autoResize` | `boolean` | `false` |
| `minRows` | `number` | - |
| `maxRows` | `number` | - |
| `disabled` | `boolean` | Field context or `false` |
| `required` | `boolean` | Field context or `false` |
| `readOnly` | `boolean` | Field context or `false` |
| `invalid` | `boolean` | Field context or `false` |
| `id` | `string` | Field control ID |

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Explicit IDs or inherited Field description/error IDs |
| `aria-invalid` | `true` when invalid |
| `aria-readonly` | `true` when read-only |
| `aria-required` | `true` when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"textarea"` |
| `[data-filled]` | Present when value is not empty |
| `[data-focused]` | Present when focused |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |
| `[data-autoresize]` | Present when auto-resize is enabled |

### Count

Displays the current value length and optional maximum, and politely announces
changes by default. It reads all values from Root context.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `count` or `count/maxLength` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-live` | `"polite"` by default; native override accepted |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"textarea-count"` |
| `[data-count]` | Current character count |
| `[data-max]` | `maxLength` when present |
| `[data-over-limit]` | Present when count exceeds max |

Advanced compound parts can read `useTextareaContext` or use the public
`TextareaContextProvider`.

## Examples

### With Field And Count

```tsx
import { Field, Textarea } from "@flowstack-ui/atom";

export default () => (
  <Field.Root id="bio">
    <Field.Label>Bio</Field.Label>
    <Textarea.Root name="bio" maxLength={160}>
      <Textarea.Count />
    </Textarea.Root>
  </Field.Root>
);
```

### Auto Resize

```tsx
import { Textarea } from "@flowstack-ui/atom";

export default () => (
  <Textarea.Root autoResize minRows={3} maxRows={8} />
);
```

## Accessibility

Textarea uses native HTML textbox semantics rather than a custom WAI-ARIA
widget. Provide a visible label or accessible name. Inside Field, description
and error IDs are connected automatically. Count uses a polite live region by
default and adds no keyboard behavior beyond the native textarea.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
