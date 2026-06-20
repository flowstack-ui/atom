# Toggle

Headless toggle button primitive for on/off command state.

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

Renders the toggle button.

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

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toggle"` |
| `[data-state]` | `"on" \| "off"` |
| `[data-value]` | Provided `value` |
| `[data-disabled]` | Present when disabled |

## Examples

### Uncontrolled

```tsx
<Toggle.Root defaultPressed ariaLabel="Bold">
  B
</Toggle.Root>
```

### Controlled

```tsx
<Toggle.Root pressed={bold} onPressedChange={setBold}>
  Bold
</Toggle.Root>
```

## Accessibility

Toggle uses the WAI-ARIA toggle button pattern through `aria-pressed`.

| Key | Description |
| --- | --- |
| `Enter` | Toggles pressed state. |
| `Space` | Toggles pressed state. |

Provide visible text or an accessible label when the toggle contains only an icon.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
