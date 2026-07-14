# Feed

Headless WAI-ARIA feed primitives for focusable article streams whose content
may load or change while users read.

## When to Use

Use Feed for a stream of articles—such as activity, news, or social posts—when
keyboard users need to move article by article and new items may load. Use List
for a static set without feed navigation. Pair Feed with Virtualizer only when
large collections require windowing; Feed itself does not fetch or virtualize.

## Features

- Implements feed and article roles.
- Supports known totals and unknown/infinite size announcements.
- Normalizes zero-based indexes to one-based positions.
- Exposes loading or mutation state with `aria-busy`.
- Implements article and outside-feed keyboard movement.
- Preserves native props and supports custom composition.

## Import

```tsx
import { Feed } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Feed.Root>
  <Feed.Item />
</Feed.Root>

useFeedContext()
```

## API Reference

### Root

Renders a `div` feed by default, provides total-size context, and handles keys
for its direct article children.

| Prop | Type | Default |
| --- | --- | --- |
| `busy` | `boolean` | `false` |
| `setSize` | `number \| "unknown"` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Positive finite sizes are truncated to integers. `"unknown"` is exposed to
ARIA as `-1`.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"feed"` |
| `aria-busy` | `"true"` while busy |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"feed"` |
| `[data-busy]` | Present while busy |

### Item

Renders a focusable `article`. `position` is one-based; zero-based `index` is
converted to one-based. A local `setSize` overrides Root.

| Prop | Type | Default |
| --- | --- | --- |
| `position` | `number` | - |
| `index` | `number` | - |
| `setSize` | `number \| "unknown"` | Root `setSize` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"article"` |
| `aria-posinset` | Normalized one-based position |
| `aria-setsize` | Normalized total or `-1` when unknown |

Item defaults `tabIndex` to `0`; a native `tabIndex` override is preserved.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"feed-item"` |
| `[data-position]` | Normalized position |
| `[data-setsize]` | Normalized total or `"unknown"` |

### useFeedContext

Returns Root's `{ busy, setSize }` state and throws outside Root.

## Examples

### Known Article Stream

```tsx
import { Feed } from "@flowstack-ui/atom";

const updates = [
  { id: "1", title: "Build finished", summary: "Version 2 is ready." },
  { id: "2", title: "Review requested", summary: "Ada requested your review." },
];

export function ActivityFeed() {
  return (
    <Feed.Root setSize={updates.length} aria-label="Activity updates">
      {updates.map((update, index) => (
        <Feed.Item key={update.id} index={index}>
          <h2>{update.title}</h2>
          <p>{update.summary}</p>
        </Feed.Item>
      ))}
    </Feed.Root>
  );
}
```

### Infinite Loading Feed

```tsx
import { Feed } from "@flowstack-ui/atom";

export function LoadingFeed({ loading }: { loading: boolean }) {
  return (
    <Feed.Root setSize="unknown" busy={loading} aria-label="News">
      <Feed.Item position={41}><h2>Latest update</h2></Feed.Item>
      <Feed.Item position={42}><h2>Earlier update</h2></Feed.Item>
    </Feed.Root>
  );
}
```

## Accessibility

Feed follows the
[WAI-ARIA Feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/).
Give Root an accessible name and each Item a useful heading or other article
name. Set `busy` while adding or replacing articles and provide accurate
positions for paged or virtualized slices.

| Key | Description |
| --- | --- |
| `PageDown` | Moves from the current Item or its descendant to the next Item. |
| `PageUp` | Moves to the previous Item. |
| `Ctrl+Home` / `Cmd+Home` | Moves to the last focusable element before Root. |
| `Ctrl+End` / `Cmd+End` | Moves to the first focusable element after Root. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
