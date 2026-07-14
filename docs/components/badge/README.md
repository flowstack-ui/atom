# Badge

Small semantic wrapper for contextual labels, counts, and status text.

## When to Use

Use Badge for short information attached to nearby content, such as an unread
count or a compact status word. Badge is not interactive and does not announce
changes automatically. Use `Button` for an action, `Progress` for completion,
or an appropriate live-region pattern when an update must be announced.

## Features

- Renders a native `span` by default.
- Keeps text content in the accessibility tree.
- Passes native span props through to the rendered element.
- Supports `asChild` and `render`.
- Adds no role, interaction, or live-region behavior automatically.

## Import

```tsx
import { Badge } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Badge.Root />
```

## API Reference

### Root

Renders an inline `span` around badge content. It provides a stable data slot
without changing the meaning or announcement behavior of its children.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"badge"` |

## Examples

### Unread Count

```tsx
import { Badge } from "@flowstack-ui/atom";

export function UnreadCount() {
  return (
    <span>
      Inbox <Badge.Root aria-label="3 unread messages">3</Badge.Root>
    </span>
  );
}
```

### Text Status

```tsx
import { Badge } from "@flowstack-ui/atom";

export function AccountStatus() {
  return (
    <p>
      Account status: <Badge.Root>Active</Badge.Root>
    </p>
  );
}
```

## Accessibility

WAI-ARIA defines no dedicated Badge pattern. Badge text is announced as normal
inline content, so make sure a number or status has enough nearby context to be
understood. Do not communicate meaning through color alone.

Root does not add `aria-live`. If a changing count must be announced, apply the
appropriate live-region behavior deliberately based on the urgency and
frequency of the update.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
