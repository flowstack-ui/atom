# QrCode

September 19 additions: Root accepts id/ids (root, frame, overlay), with stable
generated defaults and native part IDs taking precedence. Root/RootProvider,
Frame, Pattern and Overlay accept asChild. Frame must resolve to svg and Pattern
to path; projected components must forward owner props, children and refs.
Frame preserves generated backing, title/description and default Pattern.
React 18 null callbacks and React 19 cleanup functions are preserved.

useQrCodeDownload takes QR DownloadTrigger options and returns the producer and
options for the existing DownloadTrigger/useDownload owner. It performs no file
delivery itself. This lets styled libraries reuse their finished actions without
duplicating QR serialization or download lifecycle.

Encode text locally as SVG; no QR generation service, camera or payload request.

## Anatomy

Root/RootProvider render div, Frame svg, Pattern path, Overlay div and
DownloadTrigger a non-submit button. Context renders no element. One Frame and
optional Overlay belong to each Root. Frame defaults to Pattern when children
are omitted. Native props/ref pass through; SVG viewBox and path d are owned.

```tsx
import { QrCode } from "@flowstack-ui/atom/qr-code";
<QrCode.Root value="https://example.com/share">
  <QrCode.Frame aria-label="Open shared document" />
  <QrCode.DownloadTrigger fileName="share.svg" mimeType="image/svg+xml">
    Download QR
  </QrCode.DownloadTrigger>
</QrCode.Root>
```

## API Reference

Root supports value/defaultValue (string, default empty), onValueChange({value}),
encoding, pixelSize (default 10, >0 and <=100), onEncode({result}) and
onEncodingError({error}). External changes do not echo callbacks. Controller
setValue requests changes; refused controlled changes remain refused.

encoding: ecc L/M/Q/H (L), boostEcc false, minVersion 1, maxVersion 40,
maskPattern -1 (auto) or 0–7, border 4 (0–16 modules), invert false. Integers and
finite ranges are checked. Smaller quiet zones and inverted codes require scan
qualification. Empty strings encode; excessive input produces an error, never
a stale previous Pattern. encodeQrCode is the pure server-safe entry helper.
Result is immutable: version, maskPattern, size, symbolSize, border, pixelSize,
data and path. QrCodeError has options/capacity/unavailable/export/overlay code.

useQrCode provides value, result, error, state, setValue, toBlob(options) and
getDataUrl(options). RootProvider requires that controller; Context and
useQrCodeContext expose it. Committed generation callbacks do not fire during SSR.

Frame accepts titleText, description, background and native SVG fill/ARIA; it
preserves a fixed SVG host and owned viewBox. Pattern accepts SVG path props
except d/children. Overlay accepts exportSrc for arbitrary visual children;
otherwise export accepts a contained img or self-contained SVG. Its absolute
placement follows Frame, not the Root's total height.

Export options: mimeType (SVG/PNG/JPEG/WebP), quality 0–1, size integer 1–4096,
includeOverlay true and AbortSignal. Default output edge is ceil(size*pixelSize),
capped at 4096, independent of CSS display size. Export requires a mounted Frame
and Pattern. WebP rejects when unsupported. JPEG receives opaque white backing.
SVG embeds logo bytes and resolved paint, not external stylesheets or HTML.

DownloadTrigger requires fileName and mimeType, accepts export options except
signal (owned by the trigger), plus DownloadTrigger action/lifecycle props.
Pending preparation blocks duplicate activation and aborts on disable/unmount.
Images require CORS permission and must load within ten seconds. Unsupported
logos reject unless includeOverlay=false is explicit. Asset URLs/content are
trusted application inputs. Value, paint and logo are snapshotted at activation.

## Accessibility

Provide Frame aria-label/aria-labelledby or titleText; description supplies SVG
desc. Decorative Frame may explicitly be aria-hidden. Supply a normal link/copy
alternative. Overlay is decorative; do not place interactive content inside it.
No automatic raw-value labels, announcements, focus movement or form value.
RTL never mirrors the QR. Error/loading/session messages remain application-owned.

## Data Attributes

qr-code-root, qr-code-frame, qr-code-pattern, qr-code-background, qr-code-overlay
and qr-code-download-trigger slots. Root/Frame state is ready/error. Download
state is inherited idle/preparing/error. Pattern is absent on encoding failure.

## Browser limitations

QR encoding is not encryption. Four-module margin and dark-on-light paint are
recommended; tiny, dense, inverted or branded codes need independent decoding
and physical camera tests. Export may fail due to asset CORS/browser download
policy. Initiated means browser handoff, not successful saving. No automatic
retry/navigation fallback or QR payload fetch occurs.

## Evidence

Component tests, browser tests and the manual protocol distinguish automated
behavior from physical camera, screen-reader and browser download qualification.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
