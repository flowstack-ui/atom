# SkipLink

Skip navigation link and focus target primitives.

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

Link that skips to a page target.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `href` | `` `#${string}` `` | `"#main-content"` |
| `focusTarget` | `boolean` | `true` |
| `onClick` | `MouseEventHandler<HTMLAnchorElement>` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"skip-link"` |

### Target

Target element that receives programmatic focus.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `id` | `string` | `"main-content"` |
| `tabIndex` | `number` | `-1` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"skip-link-target"` |

## Examples

### Main content target

```tsx
<SkipLink.Root href="#main-content">Skip to content</SkipLink.Root>

<SkipLink.Target id="main-content">
  <h1>Dashboard</h1>
</SkipLink.Target>
```

### Native-only navigation

Set `focusTarget={false}` when the browser's default hash navigation is enough.

```tsx
<SkipLink.Root href="#main-content" focusTarget={false} />
```

## Accessibility

Skip links should be the first useful focus target on the page. The target uses
`tabIndex={-1}` by default so it can receive programmatic focus without adding an
extra Tab stop.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
