# Toggle

Headless toggle button primitive for on/off command state.

## When to Use

Use `Toggle` for a command that stays pressed, such as bold formatting or
pinning an item. Use `Switch` for a setting that turns a feature on immediately,
and use `Checkbox` for a choice submitted with a form.

## Features

- Renders a button with `aria-pressed`.
- Can be controlled or uncontrolled.
- Supports disabled state.
- Supports `asChild` and `render`.
- Exposes pressed state with data attributes.

## Import

```tsx
import { Toggle } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Toggle.Root />
```

## API Reference

### Root

Owns pressed state and renders a native button by default. Custom rendered
elements receive matching button semantics and keyboard activation.

| Prop | Type | Default |
| --- | --- | --- |
| `pressed` | `boolean` | - |
| `defaultPressed` | `boolean` | `false` |
| `onPressedChange` | `(pressed: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `value` | `string` | - |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for a custom non-native element |
| `aria-pressed` | Current pressed state |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-disabled` | `true` for a disabled custom element |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toggle"` |
| `[data-state]` | `"on" \| "off"` |
| `[data-value]` | Provided `value` |
| `[data-disabled]` | Present when disabled |

## Examples

### Uncontrolled

```tsx
import { Toggle } from "@flowstack-ui/atom";

export default function BoldToggle() {
  return <Toggle.Root defaultPressed ariaLabel="Bold">B</Toggle.Root>;
}
```

### Controlled

```tsx
import { useState } from "react";
import { Toggle } from "@flowstack-ui/atom";

export default function ControlledToggle() {
  const [bold, setBold] = useState(false);
  return <Toggle.Root pressed={bold} onPressedChange={setBold}>Bold</Toggle.Root>;
}
```

## Accessibility

Toggle follows the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
for a toggle button through `aria-pressed`.

| Key | Description |
| --- | --- |
| `Enter` | Toggles pressed state. |
| `Space` | Toggles pressed state. |

Provide visible text or an accessible label when the toggle contains only an icon.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
