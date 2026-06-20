# VisuallyHidden

Accessible content that is hidden from visual rendering.

## Features

- Keeps content available to assistive technology.
- Applies an authoritative visually-hidden style contract.
- Merges consumer styles before hiding styles.
- Supports `asChild` and `render`.

## Import

```tsx
import { VisuallyHidden } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<VisuallyHidden.Root />
```

## API Reference

### Root

Contains content that should be visually hidden but still announced.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `style` | `CSSProperties` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"visually-hidden"` |

## Examples

### Icon-only control label

```tsx
<button type="button">
  <svg aria-hidden="true" />
  <VisuallyHidden.Root>Search</VisuallyHidden.Root>
</button>
```

### Extra context

```tsx
<a href="/settings">
  Settings
  <VisuallyHidden.Root> for this workspace</VisuallyHidden.Root>
</a>
```

## Accessibility

Use `VisuallyHidden` when content should be perceivable by assistive technology
but not visible. Do not use it to hide content from assistive technology; use
`aria-hidden` for decorative content instead.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
