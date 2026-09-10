# DownloadTrigger

Generate a downloadable file after explicit activation. Existing file URLs belong
on Link with download, not in this primitive.

```tsx
import { DownloadTrigger } from "@flowstack-ui/atom/download-trigger";
<DownloadTrigger.Root data="Hello" fileName="note.txt" mimeType="text/plain">
  Download note
</DownloadTrigger.Root>
```

## Anatomy

DownloadTrigger.Root uses ButtonRoot and renders one native button. Its ref is
HTMLElement. Render adapters must preserve button semantics and forward props/ref.
There is no asChild or navigation mode; type is always button.

## API Reference

Required data is string, Blob, File, or a lazy function receiving `{ signal }` and
returning that data or a PromiseLike. fileName must be nonempty. mimeType is
required for strings; for Blob/File its explicit value overrides the intrinsic
type, falling back to application/octet-stream when neither exists.
onDownloadStart runs before preparation. onDownloadInitiated receives fileName,
mimeType and size in bytes after browser handoff. onDownloadError receives error.
Native action props, onClick/onPress, disabled/loading and render are supported.
Supply activation callbacks on Root, not inside a render adapter.

Preparation is lazy, duplicate activation is blocked while pending, and pending
producers are aborted on disable/unmount. Ignoring the AbortSignal does not allow
a stale result to initiate a download. Temporary URLs are revoked after one second.

## Accessibility

Provide visible text or an accessible name. Native keyboard activation and
aria-busy come from Button. Loading retains the label. The application supplies
translated errors and any announcements; no success announcement is invented.

## Data Attributes

data-slot=download-trigger; data-state=idle/preparing/error. Button additionally
owns data-disabled and data-loading. There are no visual styles in Atom.

## Browser limitations

Initiated is not saved/completed. User/browser policy may prevent saving. Async
Safari/iOS behavior requires physical-device qualification. No popup/navigation
fallback is attempted. Fetching, serializers, authentication and large streaming
exports remain application-owned. No download or Blob URL is created at render.

## Evidence

See test/primitives/download-trigger.test.mjs and test/browser/download-trigger.spec.ts.
Manual devices, screen readers and browser-policy restrictions require separate checks.
