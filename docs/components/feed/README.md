# Feed

Headless WAI-ARIA feed primitives for article streams such as activity feeds, news feeds, and infinite content.

## Features

- Implements `role="feed"` and `role="article"`.
- Supports known and unknown feed sizes with `aria-setsize`.
- Supports article position announcements with `aria-posinset`.
- Supports feed loading state with `aria-busy`.
- Implements Page Up, Page Down, Control/Command + Home, and Control/Command + End feed keyboard behavior.
- Keeps layout, fetching, virtualization, and item rendering outside the primitive.

## Import

```tsx
import { Feed } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Feed.Root>
  <Feed.Item />
  <Feed.Item />
</Feed.Root>
```

## API Reference

### Root

Contains all feed articles.

| Prop | Type | Default |
| --- | --- | --- |
| `busy` | `boolean` | `false` |
| `setSize` | `number \| "unknown"` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"feed"` |
| `[data-busy]` | Present when busy |

### Item

Renders one feed article.

| Prop | Type | Default |
| --- | --- | --- |
| `position` | `number` | - |
| `index` | `number` | - |
| `setSize` | `number \| "unknown"` | Root `setSize` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"feed-item"` |
| `[data-position]` | One-based item position |
| `[data-setsize]` | Total item count or `"unknown"` |

## Examples

### Known Size

Use `setSize` on the root and `index` on each item.

```tsx
<Feed.Root setSize={20}>
  {items.map((item, index) => (
    <Feed.Item key={item.id} index={index}>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
    </Feed.Item>
  ))}
</Feed.Root>
```

### Infinite Feed

Use `"unknown"` when the final item count is not known.

```tsx
<Feed.Root setSize="unknown" busy={isLoading}>
  {items.map((item, index) => (
    <Feed.Item key={item.id} index={index}>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
    </Feed.Item>
  ))}
</Feed.Root>
```

### Explicit Positions

Use `position` when items are rendered from a paged or virtualized slice and the one-based position is already known.

```tsx
<Feed.Root setSize={100}>
  {pageItems.map((item) => (
    <Feed.Item key={item.id} position={item.position}>
      <h2>{item.title}</h2>
    </Feed.Item>
  ))}
</Feed.Root>
```

## Accessibility

Follows the WAI-ARIA feed pattern. Each `Feed.Item` is focusable by default so keyboard users can move article by article.

| Key | Description |
| --- | --- |
| `PageDown` | Moves focus to the next feed article. |
| `PageUp` | Moves focus to the previous feed article. |
| `Ctrl+Home` / `Cmd+Home` | Moves focus to the first focusable element before the feed. |
| `Ctrl+End` / `Cmd+End` | Moves focus to the first focusable element after the feed. |

Prefer a heading inside each article so screen reader users have a useful article name.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
