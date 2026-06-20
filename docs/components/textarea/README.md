# Textarea

Native textarea behavior with controlled value state, Field integration,
optional auto-resize, and a count display.

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
export default () => (
  <Textarea.Root>
    <Textarea.Count />
  </Textarea.Root>
);
```

## API Reference

### Root

Renders the native textarea element and provides context to `Textarea.Count`.

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
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

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

Displays the current value length and optional `maxLength`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `count` or `count/maxLength` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"textarea-count"` |
| `[data-count]` | Current character count |
| `[data-max]` | `maxLength` when present |
| `[data-over-limit]` | Present when count exceeds max |

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

- Uses native textarea semantics.
- Provide a visible label or accessible name.
- When used inside `Field.Root`, `aria-describedby` is wired to visible
  description and error content.
- `Textarea.Count` defaults to polite announcements and can be overridden with
  native ARIA props.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
