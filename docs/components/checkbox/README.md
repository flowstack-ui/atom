# Checkbox

Headless checkbox state with indeterminate support and optional form
participation.

## Features

- Supports checked, unchecked, and indeterminate states.
- Can be controlled or uncontrolled.
- Supports read-only and disabled state.
- Renders an optional hidden checkbox input for native form submission.
- Exposes state through ARIA and data attributes.

## Import

```tsx
import { Checkbox } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Checkbox.Root>
    <Checkbox.Indicator />
  </Checkbox.Root>
);
```

## API Reference

### Root

Contains the checkbox state and renders the interactive element.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean \| "indeterminate"` | - |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked) => void` | - |
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

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox"` |
| `[data-state]` | `"checked" \| "unchecked" \| "indeterminate"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |

### Indicator

Renders visual indicator content for checked or indeterminate state.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"checkbox-indicator"` |
| `[data-state]` | `"checked" \| "unchecked" \| "indeterminate"` |
| `[data-disabled]` | Present when disabled |

## Examples

### Indeterminate

```tsx
import { Checkbox } from "@flowstack-ui/atom";

export default () => (
  <Checkbox.Root checked="indeterminate" ariaLabel="Select all">
    <Checkbox.Indicator />
  </Checkbox.Root>
);
```

### Form Submission

```tsx
import { Checkbox } from "@flowstack-ui/atom";

export default () => (
  <Checkbox.Root name="terms" value="accepted">
    Accept terms
  </Checkbox.Root>
);
```

## Accessibility

- Root renders `role="checkbox"` and owns `aria-checked`.
- Indeterminate state renders `aria-checked="mixed"`.
- Space and Enter toggle the state unless disabled or read-only.
- Provide an accessible name through visible text, `ariaLabel`, or
  `aria-labelledby`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
