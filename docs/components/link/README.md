# Link

Headless native navigation primitive for anchors and router link adapters.

## When to Use

Use `Link` when activating text or other non-interactive content navigates to
another location or resource. Use `Button` when activation performs an action,
even when that action changes what is visible on the current page.

`Link` is intentionally small. Navigation collections such as `Breadcrumb`,
`NavList`, `NavigationMenu`, and `Toolbar` add their own relationships and
keyboard or focus behavior around links.

## Features

- Renders one native `a` with `href` by default.
- Preserves browser navigation, history, context-menu, modifier-key, download,
  and new-tab behavior.
- Accepts all native anchor attributes.
- Supports `render` and `asChild` router composition.
- Forwards the anchor ref.
- Remains server-safe and adds no event handlers.
- Adds no styling, external-link inference, action, loading, or disabled API.

## Import

```tsx
import { Link } from "@flowstack-ui/atom";
// or: import { Link } from "@flowstack-ui/atom/link";
```

## Anatomy

```tsx
<Link.Root href="/guides">Read the guides</Link.Root>
```

## API Reference

### Root

Renders the navigation anchor. Native rendering requires `href`. A composed
router adapter may own its final destination instead.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | Required for default rendering |
| `children` | `ReactNode` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |
| `data-slot` | `string` | `"link"` |

All other native anchor attributes pass through, including `target`, `rel`,
`download`, `ping`, `referrerPolicy`, `hreflang`, `type`, and
`aria-current`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"link"` by default, or the consumer override |

`Link.Root` does not add a role, tab index, keyboard handler, press event,
disabled state, current-state alias, or external marker. The browser owns link
behavior.

## Examples

### Native Navigation

```tsx
import { Link } from "@flowstack-ui/atom";

export function GuidesLink() {
  return <Link.Root href="/guides">Read the guides</Link.Root>;
}
```

### Current Destination

```tsx
<nav aria-label="Account">
  <Link.Root href="/account" aria-current="page">
    Account
  </Link.Root>
</nav>
```

Use `aria-current` only when the link is current within a related navigation
set. It is not a general selected or pressed state.

### Router Composition

```tsx
import { Link } from "@flowstack-ui/atom";
import { RouterLink } from "your-router";

export function RouterGuidesLink() {
  return (
    <Link.Root asChild>
      <RouterLink to="/guides">Read the guides</RouterLink>
    </Link.Root>
  );
}
```

The router adapter must render a real anchor with a non-empty final `href`.
Atom merges props and the forwarded ref onto the adapter but does not intercept
navigation. This preserves the router's native-link handling for modifier keys,
downloads, targets, and external destinations.

An element-valued or callback `render` prop may be used instead when that is a
better fit for the router adapter.

### External Resource

```tsx
<Link.Root
  href="https://example.com/reference"
  target="_blank"
  rel="noopener"
>
  External reference
</Link.Root>
```

Atom does not infer whether a URL is external, open a new tab automatically,
or add an icon or spoken suffix. The application owns those policies.

## Accessibility

- Supply meaningful text that identifies the destination. Avoid vague repeated
  labels such as “click here.”
- Keep a real `href` on the final enabled anchor so browser and assistive
  technology link behavior remains available.
- Do not use `Link` for an action. Use `Button` instead.
- Do not nest buttons, links, or other interactive controls inside an anchor.
- Link has no generic disabled state because HTML anchors cannot be natively
  disabled. Remove unavailable navigation from the UI or use the contextual
  disabled contract of a collection component that owns one.
- Visual focus, visited, hover, current, and external indicators belong to the
  styled layer, but they must remain perceivable and distinguishable there.

## Server Rendering

`@flowstack-ui/atom/link` is server-safe. Native Link rendering owns no hooks,
context, effects, browser APIs, or event handlers. A client router adapter may
introduce its own client boundary when composed.

## Related Components

- `Button` for actions and action-styled navigation controls.
- `Breadcrumb` for hierarchical page location.
- `NavList` and `NavigationMenu` for navigation collections.
- `Toolbar.Link` for a link inside a roving-focus toolbar.
- `SkipLink` for bypass navigation to a same-page target.
