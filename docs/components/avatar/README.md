# Avatar

Image, loading fallback, and grouping primitives for representing a person or
other named entity.

## When to Use

Use Avatar when a picture or short fallback helps people recognize a user,
team, or organization. Keep a visible name nearby when identity must be clear;
an image or initials should not be the only source of important information.
Use `Badge` for a short count or status instead of an identity.

## Features

- Tracks image loading status from `Root.src`.
- Renders Image only after the source loads successfully.
- Renders Fallback while the image is missing, loading, or errored.
- Supports delayed fallback rendering to avoid brief loading flashes.
- Provides a Group wrapper for multiple avatars.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { Avatar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Avatar.Root src="/user.png">
  <Avatar.Image src="/user.png" alt="User name" />
  <Avatar.Fallback>UN</Avatar.Fallback>
</Avatar.Root>

<Avatar.Group>
  <Avatar.Root>
    <Avatar.Fallback />
  </Avatar.Root>
</Avatar.Group>
```

## API Reference

### Root

Renders a `span` and provides the loading status for its Image and Fallback.
Pass the source to Root so it can preload the image and report status changes.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `src` | `string` | - |
| `onLoadingStatusChange` | `(status: ImageLoadingStatus) => void` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-root"` |

### Image

Renders an `img` only when Root reports that its source has loaded. Its `src`
should match the source being tracked by Root, and `alt` defaults to an empty
string for decorative images.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `src` | `string` | Required |
| `alt` | `string` | `""` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-image"` |

### Fallback

Renders a `span` when the image is idle, loading, or errored. During loading it
can wait for `delayMs`; after the image loads, it renders no DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `delayMs` | `number` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-fallback"` |

### Group

Renders a `div` that groups multiple Avatar roots without adding a role. Native
div props can add `role="group"` and an accessible name when the collection
needs to be announced as one group.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-group"` |

## Examples

### Image With Delayed Fallback

```tsx
import { Avatar } from "@flowstack-ui/atom";

export function UserAvatar() {
  const source = "/alex.png";

  return (
    <Avatar.Root src={source}>
      <Avatar.Image src={source} alt="Alex Morgan" />
      <Avatar.Fallback delayMs={600}>AM</Avatar.Fallback>
    </Avatar.Root>
  );
}
```

### Decorative Avatar

```tsx
import { Avatar } from "@flowstack-ui/atom";

export function DecorativeAvatar() {
  const source = "/alex.png";

  return (
    <span>
      <Avatar.Root src={source}>
        <Avatar.Image src={source} alt="" />
        <Avatar.Fallback aria-hidden="true">AM</Avatar.Fallback>
      </Avatar.Root>
      Alex Morgan
    </span>
  );
}
```

## Accessibility

WAI-ARIA defines no dedicated Avatar pattern. Follow
[WAI image guidance](https://www.w3.org/WAI/tutorials/images/): use meaningful
`alt` text when the image communicates identity that is not already written
nearby, and use `alt=""` when the image is decorative or repeats adjacent text.

Fallback text remains in the accessibility tree while it is rendered. Hide the
Fallback with `aria-hidden="true"` when the Avatar is decorative and adjacent
text already supplies the name. Do not rely on an Avatar alone to communicate
essential identity.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
