# SkipLink

Skip navigation link and focus target primitives.

## When to Use

Use `SkipLink` near the start of every page that repeats navigation before its
main content. It lets keyboard and screen-reader users jump past that repeated
area in one action. One Root and one matching Target are enough for most pages.

## Features

- Renders a native anchor for progressive enhancement.
- Focuses and scrolls the hash target on activation.
- Safely handles malformed hash encoding.
- Provides a programmatically focusable target.
- Supports `asChild` and `render` on both parts.

## Import

```tsx
import { SkipLink } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<SkipLink.Root href="#main-content" />
<SkipLink.Target id="main-content" />
```

## API Reference

### Root

Renders the native hash link users focus and activate. By default it also moves
focus to the matching Target so keyboard navigation continues from there.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `href` | `` `#${string}` `` | `"#main-content"` |
| `focusTarget` | `boolean` | `true` |
| `onClick` | `MouseEventHandler<HTMLAnchorElement>` | - |

**ARIA:** Root uses native anchor semantics and adds no ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"skip-link"` |

### Target

Renders the destination, a neutral `div` by default, and makes it
programmatically focusable without adding it to the normal Tab order.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `id` | `string` | `"main-content"` |
| `tabIndex` | `number` | `-1` |

**ARIA:** Target adds no landmark or ARIA attributes. Applications own `main`.

### Migrating the default target

Target previously rendered `main`. To retain that landmark, use
`<SkipLink.Target asChild><main>Content</main></SkipLink.Target>`.
Otherwise place the default div inside your existing main. Keep exactly one main.
Set the matching href on Root, including when using asChild.
The default explicit focus mode does not update URL hash/history; use
`focusTarget={false}` for native fragment navigation. Modified activation,
downloads and alternate browsing targets preserve native link behavior.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"skip-link-target"` |

## Examples

### Main content target

```tsx
import { SkipLink } from "@flowstack-ui/atom";

export default function DashboardPage() {
  return (
    <>
      <SkipLink.Root href="#main-content">Skip to content</SkipLink.Root>
      <nav aria-label="Primary">Navigation</nav>
      <SkipLink.Target id="main-content" asChild>
        <main><h1>Dashboard</h1></main>
      </SkipLink.Target>
    </>
  );
}
```

### Native-only navigation

Set `focusTarget={false}` when the browser's default hash navigation is enough.

```tsx
import { SkipLink } from "@flowstack-ui/atom";

export default function NativeSkipLink() {
  return (
    <>
      <SkipLink.Root href="#main-content" focusTarget={false} />
      <SkipLink.Target id="main-content">Main content</SkipLink.Target>
    </>
  );
}
```

## Accessibility

Skip links should be the first useful focus target on the page. The target uses
`tabIndex={-1}` by default so it can receive programmatic focus without adding an
extra Tab stop.

| Key | Description |
| --- | --- |
| `Tab` | Moves focus to the skip link when it is the first useful page control. |
| `Enter` | Follows the hash link and, by default, focuses and scrolls Target. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
