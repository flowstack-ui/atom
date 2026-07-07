# Field

Accessible single-control field wiring for labels, descriptions, errors, and
shared validation state.

## Features

- Generates stable IDs for label, control, description, and error.
- Wires Field-aware controls to descriptions and visible errors.
- Shares disabled, required, readonly, and invalid state with child controls.
- Supports required and optional label indicators.
- Keeps layout outside Atom through `data-orientation`.

## Import

```tsx
import { Field } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Field.Root>
  <Field.Label requiredIndicator={null}>
    Label
    <Field.RequiredIndicator />
  </Field.Label>
  <Field.Description />
  <Field.Error />
</Field.Root>
```

## API Reference

### Root

Provides field context and renders a structural container.

| Prop | Type | Default |
| --- | --- | --- |
| `id` | `string` | Generated ID |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Label

Renders a native label linked to the generated control ID.

| Prop | Type | Default |
| --- | --- | --- |
| `requiredIndicator` | `ReactNode` | `"*"` |
| `optionalIndicator` | `ReactNode` | - |
| `disabled` | `boolean` | Field context |
| `required` | `boolean` | Field context |
| `readOnly` | `boolean` | Field context |
| `invalid` | `boolean` | Field context |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-label"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Description

Registers descriptive content for `aria-describedby`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-description"` |

### Error

Registers visible error content for `aria-describedby`.

| Prop | Type | Default |
| --- | --- | --- |
| `match` | `boolean` | - |
| `forceMatch` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-error"` |

### RequiredIndicator

Renders required or optional label adornment text.

| Prop | Type | Default |
| --- | --- | --- |
| `fallback` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-required-indicator" \| "field-optional-indicator"` |

## Examples

### With Input

```tsx
import { Field, Input } from "@flowstack-ui/atom";

<Field.Root id="email" required invalid>
  <Field.Label>Email</Field.Label>
  <Input.Root name="email" type="email" />
  <Field.Description>Use a work email.</Field.Description>
  <Field.Error>Email is required.</Field.Error>
</Field.Root>
```

## Accessibility

- `Field.Label` links with `htmlFor`.
- `Field.Description` and visible `Field.Error` are included in
  `aria-describedby` by Field-aware controls.
- `Field.Error` uses `role="alert"` when rendered.
- Required indicators are hidden from assistive technology; optional indicators
  are readable text by default.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
