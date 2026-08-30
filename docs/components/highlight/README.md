# Highlight

Highlight segments plain text against literal search queries and renders
matched segments with native `mark` semantics. Atom owns matching, overlap,
whole-word behavior, stable offsets, and structural markup. It does not own
color, decoration, search state, or result navigation.

## When to Use

Use Highlight when a styled component needs to spotlight one or more literal
queries inside plain text without recreating matching behavior. Use a native
`mark` or `em` element when the emphasis is authored and static. Keep traversal
of arbitrary React nodes, result navigation, and document search in the
application.

## Features

- Literal string or string-array queries
- Case-sensitive or case-insensitive matching
- First occurrence or every non-overlapping occurrence
- Unicode-aware whole-word matching
- Stable source offsets and deterministic overlap resolution
- Native `span` and `mark` output
- Pure segmentation utility for alternate renderers
- Server-safe rendering

## Import

```tsx
import { Highlight, findHighlightSegments } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Highlight.Root text="Accessible components" query="components" />
```

`Highlight.Root` generates a `Highlight.Match` for each selected match. Use the
pure `findHighlightSegments` utility when a different renderer must consume the
same offsets.

## API Reference

### Root

Renders a `span` containing unmatched text and generated `Match` parts. Native
span props pass through except `children` and `dangerouslySetInnerHTML`, because
the plain `text` and matching options exclusively determine the output.

| Prop | Type | Default |
| --- | --- | --- |
| `text` | `string` | required |
| `query` | `string \| readonly string[]` | required |
| `ignoreCase` | `boolean` | `true` |
| `matchAll` | `boolean` | `true` |
| `exactMatch` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"highlight"` by default |

### Match

Renders the native `mark` element for a matched segment. Native mark props pass
through when `Match` is used directly.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"highlight-match"` by default |

### findHighlightSegments

```ts
findHighlightSegments(text, {
  query,
  ignoreCase = true,
  matchAll = true,
  exactMatch = false,
});
```

Returns ordered `{ text, match, start, end, query? }` records. Queries are
literal. Matches resolve left to right; the longest query wins at one offset,
then authored query order. `exactMatch` requires Unicode-aware word boundaries.

## Examples

### Multiple queries

```tsx
import { Highlight } from "@flowstack-ui/atom";

export function SearchExcerpt() {
  return (
    <Highlight.Root
      text="Build accessible and composable interfaces."
      query={["accessible", "composable"]}
    />
  );
}
```

### Whole words

```tsx
import { Highlight } from "@flowstack-ui/atom";

export function WholeWordResult() {
  return (
    <Highlight.Root
      text="A component is composable."
      query="component"
      exactMatch
    />
  );
}
```

## Accessibility

Matches use the native `mark` element and remain part of ordinary document
reading order. Highlight introduces no role, live region, focus target, or
keyboard behavior. The consumer must not rely on color alone when the matched
state communicates essential meaning. Dynamic search result counts and active
result announcements remain application-owned.

[Changelog](./CHANGELOG.md)
