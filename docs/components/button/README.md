# Button

Headless action primitive for native buttons, links, and custom button-like elements.

## Features

- Renders a native `<button>` by default.
- Can render safe anchor links with `href`, `target`, and `rel`.
- Supports custom rendered elements with button keyboard semantics.
- Supports disabled and loading states.
- Calls `onPress` after the consumer `onClick` when the event is not canceled.
- Adds safe `rel="noopener noreferrer"` for new-tab links.

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

Renders the action element.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | - |
| `target` | `HTMLAnchorElement["target"]` | - |
| `rel` | `string` | - |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `onPress` | `(event) => void` | - |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"button"` |
| `[data-disabled]` | Present when disabled |
| `[data-loading]` | Present when loading |

## Examples

### Native Button

```tsx
<Button.Root onPress={() => saveDraft()}>Save draft</Button.Root>
```

### Link Button

```tsx
<Button.Root href="/settings">Settings</Button.Root>
```

### Loading State

```tsx
<Button.Root loading aria-label="Saving">
  Saving
</Button.Root>
```

### Custom Element

```tsx
<Button.Root render="div">Open command</Button.Root>
```

## Accessibility

Native buttons keep browser button semantics. Custom non-native elements receive `role="button"`, `tabIndex={0}`, and keyboard activation for Enter and Space.

| Key | Description |
| --- | --- |
| `Enter` | Activates custom button-like renders. Native controls keep browser behavior. |
| `Space` | Activates custom button-like renders. Native controls keep browser behavior. |

Loading buttons remain focusable and expose `aria-busy`. Disabled native buttons use the native `disabled` attribute.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
