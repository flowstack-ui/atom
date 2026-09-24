# Image

Headless source-loading and fallback primitives for ordinary images. Image owns
source status, safe transitions, conditional content/fallback rendering, native
image props, and composition. It owns no styling, optimizer, retry, or artwork.

## When to Use

Use Image when a styled layer needs one generic source with deterministic
loading, loaded, error, and absent states. Use Avatar for identity images. Use
native `img` directly when conditional fallback behavior is unnecessary.

## Features

- Tracks `idle`, `loading`, `loaded`, and `error` from Root's source.
- Renders Content in server HTML and while loading; observes the actual image without detached preloading.
- Resets safely when the source changes and ignores obsolete events.
- Preserves native image attributes, refs, `render`, and `asChild`.
- Emits stable part and status data attributes.

## Import

```tsx
import { Image } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Image.Root>
  <Image.Content />
  <Image.Fallback />
</Image.Root>
```

## API Reference

### Root

Renders a `div`, owns the source status, and provides it to both parts.

| Prop | Type | Default |
| --- | --- | --- |
| `src` | `string` | - |
| `srcSet` | `string` | - |
| `onLoadingStatusChange` | `(status: ImageLoadingStatus) => void` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Native div props pass through; src/srcSet are forwarded only to Content.
Root-known src or srcSet starts loading during SSR. Put canonical candidates on
Root to prevent a false idle fallback. Explicit Content srcSet overrides Root
for native output, for compatibility; Content-only or custom-host sources can
synchronize after mounting but cannot inform Root during SSR. Do not define
conflicting candidates on both parts. One Content host per Root is supported.

Clearing the last effective source restores idle. Real-host load/error events,
source/request-attribute changes and cached completion synchronize status.
Detached hosts cannot update status. No detached image or fetch is created.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"image"` |
| `[data-state]` | `"idle"`, `"loading"`, `"loaded"`, `"error"` |

### Content

Renders native `img` immediately when a source is supplied. `alt` is required; all
other applicable native image attributes pass through.

| Prop | Type | Default |
| --- | --- | --- |
| `alt` | `string` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"image-content"` |
| `[data-state]` | `"idle"`, `"loading"`, `"loaded"`, `"error"` |

### Fallback

Renders a `div` for selected non-loaded states. The default covers idle/error.
Opt into `when="loading"` deliberately; a loading cover can delay visible content.
Content remains mounted on error, with `hidden`, so source replacement can recover.
Without an authored fallback an error produces an empty result; supply meaningful
fallback for informative media. Multiple state-specific Fallback parts are valid.
Styled layers must preserve the native hidden behavior. The actual host must be
an image and forward its ref when using `render` or `asChild`.

Browser loading, priority and responsive-source selection remain native. Lazy
loading is a hint, not an exact visibility boundary. Withhold the source for
strict application-owned deferral. Do not lazy-load the page's critical image.

| Prop | Type | Default |
| --- | --- | --- |
| `when` | `"idle" \| "loading" \| "error" \| readonly array` | idle/error |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"image-fallback"` |
| `[data-state]` | matching non-loaded state |

## Examples

```tsx
import { Image } from "@flowstack-ui/atom";

export function WorkspaceImage() {
  return (
    <Image.Root src="/workspace.jpg" srcSet="/workspace-640.jpg 640w, /workspace-1200.jpg 1200w">
      <Image.Content
        alt="Designers reviewing a workspace"
        decoding="async"
        height={675}
        loading="lazy"
        sizes="(max-width: 48rem) 100vw, 50vw"
        width={1200}
      />
      <Image.Fallback>Image unavailable</Image.Fallback>
    </Image.Root>
  );
}
```

```tsx
import { Image } from "@flowstack-ui/atom";

export function ImageStates() {
  return (
    <Image.Root src="/report.png">
      <Image.Content alt="Quarterly report summary" />
      <Image.Fallback when="loading">Loading report</Image.Fallback>
      <Image.Fallback when={["idle", "error"]}>Report unavailable</Image.Fallback>
    </Image.Root>
  );
}
```

## Accessibility

Content uses native `img` semantics. Authors provide contextual alternative
text; use `alt=""` when decorative or redundant. Fallback has no automatic live
region. Image adds no keyboard or focus behavior. See the
[W3C WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
