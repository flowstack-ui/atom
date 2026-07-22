# PasswordToggleField

Password input with controlled visibility state and a keyboard-accessible show/hide toggle.

## When to Use

Use PasswordToggleField when a password input needs a button that lets people
check what they typed. Use Input for ordinary text and OTPField for a short
one-time verification code. Only add the visibility toggle when revealing the
password is acceptable for the product's security and privacy needs.

## Features

- Controlled and uncontrolled password visibility.
- Native password input type switching.
- Toggle button with dynamic accessible label.
- Optional icon part that switches visible/hidden content.
- Disabled, read-only, required, and invalid state propagation.
- Headless only: no icon, layout, or visual affordance is included.

## Import

```tsx
import { PasswordToggleField } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<PasswordToggleField.Root>
  <PasswordToggleField.Input />
  <PasswordToggleField.Toggle>
    <PasswordToggleField.Icon />
  </PasswordToggleField.Toggle>
</PasswordToggleField.Root>
```

## API Reference

### Root

Provides visibility and field state to its compound parts without rendering a
DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `visible` | `boolean` | - |
| `defaultVisible` | `boolean` | `false` |
| `onVisibleChange` | `(visible: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |

### Input

Renders the native input and changes its owned `type` between `password` and
`text` as visibility changes. Other native input props pass through.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-invalid` | Present when invalid |
| `aria-readonly` | Present when read only |
| `aria-required` | Present when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-input"` |
| `[data-state]` | `"visible" \| "hidden"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Toggle

Renders the button that changes visibility. Pointer down is prevented so
clicking it does not move focus away from the password input.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Show password"` or `"Hide password"` by default |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-toggle"` |
| `[data-state]` | `"visible" \| "hidden"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Icon

Decorative icon slot that renders `visible` or `hidden` content.

| Prop | Type | Default |
| --- | --- | --- |
| `visible` | `ReactNode` | - |
| `hidden` | `ReactNode` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-icon"` |
| `[data-state]` | `"visible" \| "hidden"` |

Advanced compound parts can use `usePasswordToggleFieldContext`; its provider
and context value type are also public exports.

## Examples

### Basic Password Field

```tsx
import { PasswordToggleField } from "@flowstack-ui/atom";

export function PasswordField() {
  return (
    <PasswordToggleField.Root>
      <PasswordToggleField.Input
        aria-label="Password"
        name="password"
        autoComplete="current-password"
      />
      <PasswordToggleField.Toggle>
        <PasswordToggleField.Icon visible="Hide" hidden="Show" />
      </PasswordToggleField.Toggle>
    </PasswordToggleField.Root>
  );
}
```

### Controlled Visibility

```tsx
import { useState } from "react";
import { PasswordToggleField } from "@flowstack-ui/atom";

export function ControlledPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <PasswordToggleField.Root visible={visible} onVisibleChange={setVisible}>
      <PasswordToggleField.Input aria-label="Password" />
      <PasswordToggleField.Toggle />
    </PasswordToggleField.Root>
  );
}
```

## Accessibility

The visible password input owns native validity. After a validation attempt,
Root coordinates its invalid state across Input and Toggle. Inline behavior
suppresses the browser bubble while keeping constraint validation active.

The toggle remains keyboard reachable. Its accessible label changes between “Show password” and “Hide password”; `aria-pressed` is intentionally not used because the label already communicates the action.

| Key | Description |
| --- | --- |
| `Tab` | Moves focus between the input, toggle, and surrounding controls. |
| `Enter` | Activates the focused toggle. |
| `Space` | Activates the focused toggle. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
