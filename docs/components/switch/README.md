# Switch

Headless on/off switch with optional native form participation.

## Features

- Renders a WAI-ARIA switch.
- Can be controlled or uncontrolled.
- Supports disabled, read-only, required, and invalid states.
- Renders an optional hidden checkbox input for native form submission.
- Includes a decorative thumb part that mirrors root state.
- Supports `asChild` and `render`.

## Import

```tsx
import { Switch } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Switch.Root>
  <Switch.Thumb />
</Switch.Root>
```

## API Reference

### Root

Contains the switch state and renders the interactive element.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | - |
| `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
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
| `[data-slot]` | `"switch"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Thumb

Renders decorative thumb content for the switch.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"switch-thumb"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

## Examples

### Form Submission

```tsx
<Switch.Root name="notifications" value="enabled">
  <Switch.Thumb />
</Switch.Root>
```

### Controlled

```tsx
<Switch.Root checked={enabled} onCheckedChange={setEnabled}>
  <Switch.Thumb />
</Switch.Root>
```

## Accessibility

Root renders `role="switch"` and owns `aria-checked`.

| Key | Description |
| --- | --- |
| `Enter` | Toggles checked state through native button activation. |
| `Space` | Toggles checked state through native button activation. |

Provide visible text, `ariaLabel`, or `aria-labelledby`. Read-only switches remain focusable but cannot toggle. Disabled switches use native button disabled behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
