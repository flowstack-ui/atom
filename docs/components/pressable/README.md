# Pressable

Headless press interaction primitive for custom interactive surfaces.

## When to Use

Use `Pressable` when a custom surface, such as a card or canvas control, must
behave like one button for pointer and keyboard users. Use `Button` for a normal
command, `Toggle` for an on/off control, and a native link for navigation.
Those more specific components communicate their purpose more clearly.

## Features

- Renders a native `<button>` by default.
- Adds button semantics for custom non-native renders.
- Supports pointer press state through `data-pressed`.
- Supports disabled state and press cancellation.
- Fires `onPress` for pointer and keyboard activation.
- Handles Space activation on keyup for ARIA button parity.
- Cancels custom-render press activation when the pointer releases outside the
  pressable target.

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

Owns one press interaction and renders a native `button` by default. When you
render another element, it supplies button semantics and matching keyboard
activation.

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

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` on a non-native rendered element |
| `aria-disabled` | `true` on a disabled non-native rendered element |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pressable"` |
| `[data-disabled]` | Present when disabled |
| `[data-pressed]` | Present while pointer pressed |

## Examples

### Pressable Card

```tsx
import { Pressable } from "@flowstack-ui/atom";

export default function ProjectCard() {
  return (
    <Pressable.Root
      render="div"
      aria-label="Open Project Alpha"
      onPress={() => window.alert("Opening Project Alpha")}
    >
      Project Alpha
    </Pressable.Root>
  );
}
```

### Disabled Custom Surface

```tsx
import { Pressable } from "@flowstack-ui/atom";

export default function DisabledAction() {
  return (
    <Pressable.Root render="div" disabled>
      Unavailable action
    </Pressable.Root>
  );
}
```

## Accessibility

`Pressable` follows native button behavior and the
[WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) when
rendered as a non-native element. Give the control an accessible name through
visible text, `aria-label`, or `aria-labelledby`.

| Key | Description |
| --- | --- |
| `Enter` | Activates custom non-native renders on keydown. |
| `Space` | Activates custom non-native renders on keyup. |

Custom non-native renders receive `role="button"` and `aria-disabled` when disabled.
They also suppress the follow-up click when a pointer press starts on the
pressable but releases outside, matching native button activation behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
