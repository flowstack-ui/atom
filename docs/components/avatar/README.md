# Avatar

Avatar image, fallback, and grouping primitives.

## Features

- Tracks image loading status.
- Renders fallback content while the image is missing, loading, or errored.
- Supports delayed fallback rendering to avoid loading flashes.
- Provides a group wrapper for stacked or clustered avatars.
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
  <Avatar.Root src="/one.png" />
  <Avatar.Root src="/two.png" />
</Avatar.Group>
```

## API Reference

### Root

Provides image loading status to avatar parts.

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

Renders the image once it has loaded.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `src` | `string` | - |
| `alt` | `string` | `""` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-image"` |

### Fallback

Renders fallback content when the image is not loaded.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `delayMs` | `number` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-fallback"` |

### Group

Groups multiple avatars.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"avatar-group"` |

## Examples

### Delayed fallback

```tsx
<Avatar.Root src="/user.png">
  <Avatar.Image src="/user.png" alt="User name" />
  <Avatar.Fallback delayMs={600}>UN</Avatar.Fallback>
</Avatar.Root>
```

### Decorative avatar

Use an empty `alt` value when the same name is already visible nearby.

```tsx
<Avatar.Root src="/user.png">
  <Avatar.Image src="/user.png" alt="" />
  <Avatar.Fallback>UN</Avatar.Fallback>
</Avatar.Root>
```

## Accessibility

Use meaningful `alt` text when the avatar image communicates information that is
not available elsewhere. Use `alt=""` for decorative avatars or when adjacent
text already names the person/entity.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
