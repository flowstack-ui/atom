# Button

Action primitive for native buttons, links, and custom button-like elements.

## When to Use

Use Button when the user performs an action such as saving, submitting, or
opening a control. Provide `href` when the control navigates to another
location. Use `Toggle` when the pressed state must stay on or off, and use
`Pressable` for a custom interactive surface that needs press-state behavior
without Button's link and loading APIs.

## Features

- Renders a native `button` by default.
- Renders a native `a` when `href` is provided.
- Supplies button role, focusability, and keyboard activation to non-native
  custom renders.
- Supports disabled and loading states.
- Calls `onPress` after `onClick` when the click is not canceled.
- Prevents inactive controls from firing consumer activation handlers.
- Adds `noopener noreferrer` to new-tab links while preserving other `rel`
  tokens.
- Supports `asChild` and `render`.

## Import

```tsx
import { Button } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Button.Root />
```

## API Reference

### Root

Renders the action element and owns its activation, inactive-state, and safe
link behavior. Native button props pass through by default; anchor-related props
apply when `href` is provided.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | - |
| `target` | `AnchorHTMLAttributes<HTMLAnchorElement>["target"]` | - |
| `rel` | `AnchorHTMLAttributes<HTMLAnchorElement>["rel"]` | - |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `onPress` | `MouseEventHandler<HTMLElement>` | - |
| `onClick` | `MouseEventHandler<HTMLElement>` | - |
| `onKeyDown` | `KeyboardEventHandler<HTMLElement>` | - |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for non-native action renders; `"link"` for an inactive default anchor |
| `aria-disabled` | `"true"` when a non-native control is disabled or loading |
| `aria-busy` | `"true"` when loading |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"button"` |
| `[data-disabled]` | Present when disabled |
| `[data-loading]` | Present when loading |

A native button receives the native `disabled` attribute only when `disabled`
is true. A loading native button remains focusable, exposes `aria-busy`, and
blocks activation. Inactive links omit `href`, `target`, and `rel`.

## Examples

### Action Button

```tsx
import { Button } from "@flowstack-ui/atom";

export function SaveButton() {
  return (
    <Button.Root onPress={() => console.log("Draft saved")}>
      Save draft
    </Button.Root>
  );
}
```

### Navigation Link

```tsx
import { Button } from "@flowstack-ui/atom";

export function SettingsLink() {
  return <Button.Root href="/settings">Settings</Button.Root>;
}
```

### Loading Action

```tsx
import { Button } from "@flowstack-ui/atom";

export function SavingButton() {
  return (
    <Button.Root loading aria-label="Saving changes">
      Saving
    </Button.Root>
  );
}
```

### Custom Button Element

```tsx
import { Button } from "@flowstack-ui/atom";

export function CustomButton() {
  return (
    <Button.Root
      render="div"
      onPress={() => console.log("Command opened")}
    >
      Open command
    </Button.Root>
  );
}
```

## Accessibility

Button follows the
[WAI-ARIA Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
Prefer the default native `button` because the browser supplies its semantics
and keyboard behavior. Every Button needs an accessible name from its text,
`aria-label`, or `aria-labelledby`.

Custom non-native action elements receive `role="button"`, `tabIndex={0}`, and
keyboard activation. Disabled native buttons use the native `disabled`
attribute. Disabled or loading non-native controls expose `aria-disabled`, and
loading controls expose `aria-busy` while remaining focusable.

| Key | Description |
| --- | --- |
| `Enter` | Activates custom button-like renders; native controls keep browser behavior. |
| `Space` | Activates custom button-like renders; native controls keep browser behavior. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
