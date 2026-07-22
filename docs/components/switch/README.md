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
provides state to Thumb and renders a transparent native checkbox when `name`
or `required` needs native form behavior. The proxy is aligned to Root,
participates in required validation without `readonly`, and redirects browser
validation focus to the visible switch.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | - |
| `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `name` | `string` | - |
| `value` | `string` | `"on"` |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"switch"` |
| `aria-checked` | Current checked state |
| `aria-label` | Native value when provided |
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
  return <Switch.Root name="notifications" value="enabled" aria-label="Notifications"><Switch.Thumb /></Switch.Root>;
}
```

### Controlled

```tsx
import { useState } from "react";
import { Switch } from "@flowstack-ui/atom";

export default function ControlledSwitch() {
  const [enabled, setEnabled] = useState(false);
  return <Switch.Root checked={enabled} onCheckedChange={setEnabled} aria-label="Notifications"><Switch.Thumb /></Switch.Root>;
}
```

## Accessibility

After native constraint validation runs, proxy invalidity is mirrored to the
visible Root and its Field. Inline behavior suppresses the browser bubble while
native behavior keeps the aligned browser UI.

Switch follows the [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).
Root owns the switch role and checked state; Thumb is decorative.

| Key | Description |
| --- | --- |
| `Enter` | Toggles checked state. |
| `Space` | Toggles checked state. |

Provide visible text, native `aria-label`, or `aria-labelledby`. Inside Field,
Switch inherits state, control ID, and descriptions. Uncontrolled state resets
to `defaultChecked`. Read-only switches remain focusable but cannot toggle.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
