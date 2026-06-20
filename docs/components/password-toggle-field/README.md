# PasswordToggleField

Password input with controlled visibility state and a keyboard-accessible show/hide toggle.

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
export default () => (
  <PasswordToggleField.Root>
    <PasswordToggleField.Input />
    <PasswordToggleField.Toggle>
      <PasswordToggleField.Icon />
    </PasswordToggleField.Toggle>
  </PasswordToggleField.Root>
);
```

## API Reference

### Root

Provides visibility and field state.

| Prop | Type | Default |
| --- | --- | --- |
| `visible` | `boolean` | - |
| `defaultVisible` | `boolean` | `false` |
| `onVisibleChange` | `(visible: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |

### Input

Native input whose `type` is controlled by visibility.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"password-toggle-field-input"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-input"` |
| `[data-visible]` | Present when password is visible |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Toggle

Button that toggles password visibility.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"password-toggle-field-toggle"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-toggle"` |
| `[data-visible]` | Present when password is visible |
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
| `data-slot` | `string` | `"password-toggle-field-icon"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"password-toggle-field-icon"` |
| `[data-visible]` | Present when password is visible |

## Examples

### Basic Password Field

```tsx
<PasswordToggleField.Root>
  <PasswordToggleField.Input name="password" autoComplete="current-password" />
  <PasswordToggleField.Toggle>
    <PasswordToggleField.Icon visible="Hide" hidden="Show" />
  </PasswordToggleField.Toggle>
</PasswordToggleField.Root>
```

### Controlled Visibility

```tsx
<PasswordToggleField.Root visible={visible} onVisibleChange={setVisible}>
  <PasswordToggleField.Input />
  <PasswordToggleField.Toggle />
</PasswordToggleField.Root>
```

## Accessibility

The toggle remains keyboard reachable. Its accessible label changes between “Show password” and “Hide password”; `aria-pressed` is intentionally not used because the label already communicates the action.

| Key | Description |
| --- | --- |
| `Tab` | Moves focus between the input, toggle, and surrounding controls. |
| `Enter` | Activates the focused toggle. |
| `Space` | Activates the focused toggle. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
