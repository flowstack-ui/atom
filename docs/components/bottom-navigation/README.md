# BottomNavigation

Navigation landmark with active-destination state for a small set of primary
application destinations.

## When to Use

Use BottomNavigation for a short, stable set of top-level destinations commonly
placed at the bottom of a compact application. Prefer links when each item
changes the URL. Use `NavList` for longer or grouped navigation, and use `Tabs`
when switching panels inside the current page rather than navigating to a new
destination.

## Features

- Renders a named `nav` landmark.
- Supports link destinations and button-based view changes.
- Supports controlled and uncontrolled active value.
- Marks the active destination with `aria-current="page"`.
- Exposes active, disabled, value, and label-visibility state through data
  attributes.
- Supports `asChild` and `render` on both parts.

## Import

```tsx
import { BottomNavigation } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<BottomNavigation.Root>
  <BottomNavigation.Item value="home" />
  <BottomNavigation.Item value="search" />
  <BottomNavigation.Item value="profile" />
</BottomNavigation.Root>
```

## API Reference

### Root

Renders the `nav` landmark and owns the active value shared by every Item. The
default accessible label can be replaced with a label appropriate to the
application.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string \| null` | - |
| `defaultValue` | `string \| null` | `null` |
| `onChange` | `(value: string) => void` | - |
| `showLabels` | `boolean` | `true` |
| `ariaLabel` | `string` | `"Bottom navigation"` |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"bottom-nav-root"` |

### Item

Represents one destination and updates Root's active value when activated. It
renders an `a` when `href` is provided and a `button` otherwise. Disabled links
omit `href` and leave the tab order.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string` | Required |
| `href` | `string` | - |
| `target` | `string` | - |
| `rel` | `string` | - |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` when the Item is active |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"bottom-nav-item"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-value]` | Item value |
| `[data-active]` | Present when active |
| `[data-disabled]` | Present when disabled |
| `[data-label-visible]` | Present when labels should be visibly presented |

## Examples

### Link Destinations

```tsx
import { BottomNavigation } from "@flowstack-ui/atom";

export function PrimaryDestinations() {
  return (
    <BottomNavigation.Root
      defaultValue="home"
      ariaLabel="Primary destinations"
    >
      <BottomNavigation.Item value="home" href="/home">
        Home
      </BottomNavigation.Item>
      <BottomNavigation.Item value="search" href="/search">
        Search
      </BottomNavigation.Item>
      <BottomNavigation.Item value="profile" href="/profile">
        Profile
      </BottomNavigation.Item>
    </BottomNavigation.Root>
  );
}
```

### Controlled View Selection

```tsx
import { useState } from "react";
import { BottomNavigation } from "@flowstack-ui/atom";

export function ControlledDestinations() {
  const [value, setValue] = useState("activity");

  return (
    <>
      <p>Current view: {value}</p>
      <BottomNavigation.Root value={value} onChange={setValue}>
        <BottomNavigation.Item value="activity">Activity</BottomNavigation.Item>
        <BottomNavigation.Item value="messages">Messages</BottomNavigation.Item>
      </BottomNavigation.Root>
    </>
  );
}
```

## Accessibility

WAI-ARIA defines no dedicated Bottom Navigation pattern. Root uses a native
navigation landmark and follows
[WAI-ARIA landmark guidance](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/).
Give the landmark a concise name that distinguishes it from other navigation
regions.

Items with `href` use native link behavior and expose `aria-current="page"`
when active. Prefer links for real destinations so browser navigation features
continue to work. Button Items retain native button keyboard behavior for
application-controlled view changes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
