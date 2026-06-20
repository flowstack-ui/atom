# Label

Standalone native label primitive with state data attributes.

## Features

- Renders a native `<label>`.
- Passes native label props through.
- Converts field-like state props to data attributes.
- Supports `asChild` and `render`.
- Does not create a client boundary.

## Import

```tsx
import { Label } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Label.Root />
);
```

## API Reference

### Root

Renders a native label element.

| Prop | Type | Default |
| --- | --- | --- |
| `htmlFor` | `string` | - |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"label"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

## Examples

### Native Label

```tsx
import { Label } from "@flowstack-ui/atom";

export default () => (
  <>
    <Label.Root htmlFor="email">Email</Label.Root>
    <input id="email" name="email" />
  </>
);
```

### Field-Aware Label

```tsx
import { Field, Input } from "@flowstack-ui/atom";

export default () => (
  <Field.Root id="email" required>
    <Field.Label>Email</Field.Label>
    <Input.Root name="email" />
  </Field.Root>
);
```

## Accessibility

- Uses native label semantics.
- Use `htmlFor` or native nested-control labeling.
- `disabled`, `required`, `readOnly`, and `invalid` are not valid label DOM
  attributes, so Atom exposes them as data attributes only.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
