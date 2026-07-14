# Switch

Headless on/off switch with optional native form participation.

## When to Use

Use `Switch` for a setting that becomes active or inactive immediately, such as
notifications. Use `Checkbox` when the choice is part of a form that is applied
later, and use `Toggle` for a pressed command like bold text.

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

Owns the checked and form state and renders a native button by default. It also
provides state to Thumb and renders a hidden checkbox when `name` is present.

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

| ARIA attribute | Values |
| --- | --- |
| `role` | `"switch"` |
| `aria-checked` | Current checked state |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-required` | `true` when required |
| `aria-readonly` | `true` when read-only |
| `aria-invalid` | `true` when invalid |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"switch"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Thumb

Mirrors Root state for the movable visual part while remaining hidden from
assistive technology.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"switch-thumb"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

Advanced compound parts can read `useSwitchContext` or use the public
`SwitchContextProvider`.

## Examples

### Form Submission

```tsx
import { Switch } from "@flowstack-ui/atom";

export default function NotificationSetting() {
  return <Switch.Root name="notifications" value="enabled" ariaLabel="Notifications"><Switch.Thumb /></Switch.Root>;
}
```

### Controlled

```tsx
import { useState } from "react";
import { Switch } from "@flowstack-ui/atom";

export default function ControlledSwitch() {
  const [enabled, setEnabled] = useState(false);
  return <Switch.Root checked={enabled} onCheckedChange={setEnabled} ariaLabel="Notifications"><Switch.Thumb /></Switch.Root>;
}
```

## Accessibility

Switch follows the [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).
Root owns the switch role and checked state; Thumb is decorative.

| Key | Description |
| --- | --- |
| `Enter` | Toggles checked state. |
| `Space` | Toggles checked state. |

Provide visible text, `ariaLabel`, or `aria-labelledby`. Read-only switches remain focusable but cannot toggle. Disabled switches use native button disabled behavior. Non-native `asChild` and `render` switches receive Atom keyboard activation.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
