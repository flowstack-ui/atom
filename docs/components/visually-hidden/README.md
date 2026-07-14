# VisuallyHidden

Accessible content that is hidden from visual rendering.

## When to Use

Use `VisuallyHidden` when assistive technology needs words that sighted users
already understand from context, such as the label for an icon-only button.
Use visible text whenever everyone benefits from the explanation. Do not use it
to hide decorative content from screen readers; use `aria-hidden` for that.

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

Renders a `span` by default and applies the package's exported
`visuallyHiddenStyle` after consumer styles so the content stays available to
assistive technology without affecting visual layout.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `style` | `CSSProperties` | - |

**ARIA:** Root adds no role or ARIA attributes. Its content remains in the
accessibility tree through normal HTML semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"visually-hidden"` |

The flat `visuallyHiddenStyle` export provides the same authoritative style
object for advanced cases that cannot use Root.

## Examples

### Icon-only control label

```tsx
import { VisuallyHidden } from "@flowstack-ui/atom";

export default function SearchButton() {
  return (
    <button type="button">
      <span aria-hidden="true">⌕</span>
      <VisuallyHidden.Root>Search</VisuallyHidden.Root>
    </button>
  );
}
```

### Extra context

```tsx
import { VisuallyHidden } from "@flowstack-ui/atom";

export default function WorkspaceSettingsLink() {
  return (
    <a href="/settings">
      Settings
      <VisuallyHidden.Root> for this workspace</VisuallyHidden.Root>
    </a>
  );
}
```

## Accessibility

Use `VisuallyHidden` when content should be perceivable by assistive technology
but not visible. Do not use it to hide content from assistive technology; use
`aria-hidden` for decorative content instead.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
