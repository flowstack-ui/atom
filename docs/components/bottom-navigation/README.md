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
- Supports always-visible, active-only, and fully visually-hidden label intent.
- Exposes static, sticky, absolute, and fixed positioning intent for styled
  layers without applying styles.
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
| `labelVisibility` | `"always" \| "active" \| "hidden"` | `"always"` |
| `showLabels` | `boolean` | Deprecated compatibility alias |
| `position` | `"static" \| "sticky" \| "absolute" \| "fixed"` | `"static"` |
| `ariaLabel` | `string` | `"Bottom navigation"` |
| `aria-label` | `string` | Overrides the alias |
| `aria-labelledby` | `string` | Uses an authored heading; suppresses the fallback label |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Explicit native name, otherwise alias/default when not labelled by another element |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"bottom-nav-root"` |
| `[data-label-visibility]` | `"always" \| "active" \| "hidden"` |
| `[data-position]` | `"static" \| "sticky" \| "absolute" \| "fixed"` |

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
| `download` | `string \| boolean` | - |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` for native buttons |
| `disabled` | `boolean` | `false` |

Native button and anchor composition keeps these same defaults. Custom render
adapters must forward behavior props and own native semantics when their final
host cannot be inspected. Consumer click handlers can cancel selection with
`preventDefault()`. Modified clicks, download links and non-self targets retain
native behavior without changing the current destination. For routes, control
`value` from the application's actual location.

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

`labelVisibility` is authoritative when both it and the deprecated
`showLabels` prop are supplied. Without `labelVisibility`, `showLabels={false}`
maps to `"active"`; every other legacy/default case maps to `"always"`.
Atom does not hide label content itself. Styled layers use Root and Item data
attributes while retaining the authored text in the accessibility tree.

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

### Icon-only Presentation Intent

```tsx
import { BottomNavigation } from "@flowstack-ui/atom";

export function CompactDestinations() {
  return (
    <BottomNavigation.Root
      ariaLabel="Primary destinations"
      defaultValue="home"
      labelVisibility="hidden"
      position="fixed"
    >
      <BottomNavigation.Item value="home" href="/home">Home</BottomNavigation.Item>
      <BottomNavigation.Item value="search" href="/search">Search</BottomNavigation.Item>
    </BottomNavigation.Root>
  );
}
```

The styled layer may visually hide both labels, but it must keep the authored
text available as each Item's accessible name. `position` is metadata only;
the styled layer applies positioning and the application coordinates page
content around an overlay.

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

Use `labelVisibility="hidden"` only when every destination remains clear from
its visual icon and accessible name. Atom never removes the label from the DOM.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
