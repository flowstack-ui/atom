# Label

Server-safe native label primitive with optional state metadata.

## When to Use

Use Label when one native form control needs a standalone text label. Use
`Field.Label` when the control also needs shared required, disabled, invalid,
description, or error wiring. Label's state props are metadata only: they do
not change the associated control.

## Features

- Renders a native `label` and passes native label props through.
- Supports explicit `htmlFor` and native wrapped-control labeling.
- Converts field-like state props to stable data attributes.
- Supports `asChild` and `render` composition.
- Adds no client boundary or keyboard behavior.

## Import

```tsx
import { Label } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Label.Root />
```

## API Reference

### Root

Renders a native `label` by default. Its state props expose consumer-owned
state for selectors but do not apply that state to a form control.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Native label props such as `htmlFor` pass through.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"label"` |
| `[data-disabled]` | Present when `disabled` |
| `[data-required]` | Present when `required` |
| `[data-readonly]` | Present when `readOnly` |
| `[data-invalid]` | Present when `invalid` |

## Examples

### Explicit Native Label

```tsx
import { Label } from "@flowstack-ui/atom";

export function EmailControl() {
  return (
    <div>
      <Label.Root htmlFor="email">Email</Label.Root>
      <input id="email" name="email" type="email" />
    </div>
  );
}
```

### Wrapped Control

```tsx
import { Label } from "@flowstack-ui/atom";

export function NewsletterControl() {
  return (
    <Label.Root>
      <input name="newsletter" type="checkbox" />
      Receive the newsletter
    </Label.Root>
  );
}
```

## Accessibility

Label uses native HTML labeling. Match `htmlFor` to the control's `id`, or
place the control inside Label. The state data attributes do not announce
anything and do not replace native `disabled`, `required`, `readOnly`, or
`aria-invalid` state on the control. Label owns no keyboard interaction.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
