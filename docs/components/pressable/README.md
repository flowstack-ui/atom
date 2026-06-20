# Pressable

Headless press interaction primitive for custom interactive surfaces.

## Features

- Renders a native `<button>` by default.
- Adds button semantics for custom non-native renders.
- Supports pointer press state through `data-pressed`.
- Supports disabled state and press cancellation.
- Fires `onPress` for pointer and keyboard activation.
- Handles Space activation on keyup for ARIA button parity.

## Import

```tsx
import { Pressable } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Pressable.Root />
```

## API Reference

### Root

Renders a pressable element.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `onPress` | `(event) => void` | - |
| `onClick` | `(event) => void` | - |
| `onKeyDown` | `(event) => void` | - |
| `onKeyUp` | `(event) => void` | - |
| `onPointerDown` | `(event) => void` | - |
| `onPointerUp` | `(event) => void` | - |
| `onPointerCancel` | `(event) => void` | - |
| `onLostPointerCapture` | `(event) => void` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pressable"` |
| `[data-disabled]` | Present when disabled |
| `[data-pressed]` | Present while pointer pressed |

## Examples

### Pressable Card

```tsx
<Pressable.Root render="div" onPress={() => openDetails()}>
  Project Alpha
</Pressable.Root>
```

### Disabled Custom Surface

```tsx
<Pressable.Root render="div" disabled>
  Unavailable action
</Pressable.Root>
```

## Accessibility

Use `Pressable` when a non-button surface needs button-like interaction. Prefer `Button` for normal command buttons.

| Key | Description |
| --- | --- |
| `Enter` | Activates custom non-native renders on keydown. |
| `Space` | Activates custom non-native renders on keyup. |

Custom non-native renders receive `role="button"` and `aria-disabled` when disabled.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
