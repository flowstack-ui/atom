# BottomNavigation

Mobile-style navigation landmark with active destination state.

## Features

- Renders a named `nav` landmark.
- Supports link destinations and button destinations.
- Supports controlled and uncontrolled active value.
- Exposes active, disabled, and label-visibility state through data attributes.
- Supports `asChild` and `render` on every part.

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

Contains bottom navigation destinations.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string \| null` | - |
| `defaultValue` | `string \| null` | `null` |
| `onChange` | `(value: string) => void` | - |
| `showLabels` | `boolean` | `true` |
| `ariaLabel` | `string` | `"Bottom navigation"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"bottom-nav-root"` |

### Item

Represents one destination.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string` | Required |
| `href` | `string` | - |
| `target` | `string` | - |
| `rel` | `string` | - |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"bottom-nav-item"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-value]` | Item value |
| `[data-active]` | Present when active |
| `[data-disabled]` | Present when disabled |
| `[data-label-visible]` | Present when the label should be visible |

## Examples

### Link destinations

```tsx
<BottomNavigation.Root defaultValue="home">
  <BottomNavigation.Item value="home" href="/home">Home</BottomNavigation.Item>
  <BottomNavigation.Item value="search" href="/search">Search</BottomNavigation.Item>
</BottomNavigation.Root>
```

### Controlled destination

```tsx
<BottomNavigation.Root value={value} onChange={setValue}>
  <BottomNavigation.Item value="home">Home</BottomNavigation.Item>
  <BottomNavigation.Item value="profile">Profile</BottomNavigation.Item>
</BottomNavigation.Root>
```

## Accessibility

`BottomNavigation.Root` is a `nav` landmark with an accessible label. Items use
native anchor semantics when `href` is provided and native button semantics
otherwise. Active items expose `aria-current="page"`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
