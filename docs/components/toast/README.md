# Toast

Toast provider, store, live announcements, viewport, and dismissible toast parts.

## When to Use

Use `Toast` for a short update that does not block the current task, such as
“Saved” or “Upload failed.” Use inline feedback when the message belongs beside
a field, and use `AlertDialog` when the user must respond before continuing.
Never put essential information only in a toast because it disappears.

## Features

- Supports declarative and imperative toast rendering.
- Includes a global toast store and `toast.*` helpers.
- Supports queueing with a maximum visible count.
- Announces each create or meaningful content update exactly once through
  persistent polite and assertive live regions.
- Supports hover, focus-within, and page-focus-loss pause behavior.
- Provides a labelled notification region reachable with `F8`, focused Escape
  dismissal, and focus restoration.
- Supports logical start/end positions and optional directional swipe dismissal.
- Supports custom viewport rendering.
- Supports `asChild` and `render` on visual parts.

## Import

```tsx
import { Toast, toast } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Toast.Provider>
  <Toast.Root>
    <Toast.Title />
    <Toast.Description />
    <Toast.Action />
    <Toast.Cancel />
    <Toast.Close />
  </Toast.Root>

  <Toast.Viewport />
</Toast.Provider>
```

## API Reference

### Provider

Shares queue, pause, expansion, and close-button defaults with declarative and
imperative toasts. Provider renders only its children.

| Prop | Type | Default |
| --- | --- | --- |
| `maxVisible` | `number` | `3` |
| `expandOnHover` | `boolean` | `true` |
| `closeButton` | `boolean` | `false` |
| `pauseOnHover` | `boolean` | `true` |
| `pauseOnFocusLoss` | `boolean` | `true` |
| `pauseOnFocus` | `boolean` | `true` |
| `hotkey` | `readonly string[]` | `["F8"]` |
| `label` | `string` | `"Notifications"` |
| `swipeDirection` | `"left" \| "right" \| "up" \| "down"` | - |
| `swipeThreshold` | `number` | `50` |

`maxVisible` is normalized to a positive integer. Invalid values use `3`.
`swipeThreshold` is normalized to a positive number. An omitted direction
disables swipe; swipe is never the only dismissal mechanism.

**ARIA:** Provider renders no element and adds no ARIA attributes.

**Data attributes:** Provider renders no element and exposes none.

### Root

Owns one toast's lifecycle, timer, pause state, dismissal callbacks, focused
Escape behavior, and optional swipe state. Visible Root is intentionally not a
live region; Viewport's persistent announcers are the sole announcement path.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `toast` | `ToastData` | - |
| `type` | `"default" \| "success" \| "error" \| "warning" \| "info" \| "loading"` | `"default"` |
| `duration` | `number` | Type default |
| `paused` | `boolean` | `false` |
| `dismissible` | `boolean` | `true` |
| `closeButton` | `boolean` | Provider value |
| `index` | `number` | - |
| `expanded` | `boolean` | - |
| `removeDelay` | `number` | `200` |
| `forceMount` | `boolean` | `false` |
| `onAutoClose` | `() => void` | - |
| `onDismiss` | `() => void` | - |
| `swipeDirection` | `"left" \| "right" \| "up" \| "down"` | Provider value |
| `swipeThreshold` | `number` | Provider value |

Root adds no live-region ARIA. Consumers should not add `role="status"`,
`role="alert"`, or `aria-live` to a store-rendered Root because doing so would
create a second announcement path.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast"` |
| `[data-state]` | `"entering" \| "visible" \| "exiting"` |
| `[data-type]` | Toast type |
| `[data-index]` | Visible stack index |
| `[data-expanded]` | Present when expanded |
| `[data-toast-id]` | Store toast ID when present |
| `[data-swipe-direction]` | Configured direction when enabled |
| `[data-swipe]` | `"start" \| "move" \| "cancel" \| "end"` during a gesture |

Swipe movement is exposed through `--atom-toast-swipe-move-x` and
`--atom-toast-swipe-move-y` for a styled layer to consume.

### Title

Provides the concise heading announced as part of the current Root.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Title adds no role or ARIA attributes; Viewport's persistent live
region announces its store content.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-title"` |

### Description

Provides supporting message text announced with Title inside the current Root.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Description adds no role or ARIA attributes; Viewport announces its
store content.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-description"` |

### Action

Action button. Clicking it dismisses the toast after the action runs.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `altText` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `altText` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-action"` |

### Cancel

Cancel button. Clicking it dismisses the toast after the cancel action runs.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `altText` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `altText` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-cancel"` |

### Close

Dismiss button.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `aria-label` | `string` | `"Dismiss notification"` |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Explicit value or `"Dismiss notification"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-close"` |

### Viewport

Portaled viewport that renders visible queued toasts.
When `asChild` is used, the child element becomes the viewport and queued
toasts still render inside that child.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `position` | logical `start/end`, center, and retained physical `left/right` positions | `"bottom-right"` |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `portalDisabled` | `boolean` | `false` |
| `renderToast` | `(state: ToastViewportRenderState) => ReactNode` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"region"` on the visible viewport |
| `aria-label` | Provider label plus formatted hotkey |
| `tabIndex` | `-1` for programmatic hotkey focus |
| `aria-live` | Hidden announcers use `"polite"` and `"assertive"` |
| `aria-atomic` | Hidden announcers use `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-viewport"` |
| `[data-position]` | Toast position |
| `[data-expanded]` | Present when expanded |
| `[data-slot="toast-announcer-polite"]` | Polite live region |
| `[data-slot="toast-announcer-assertive"]` | Assertive live region |

The flat API also exports the `toast` helper, store mutation/subscription
functions, `useToastStore`, role/duration/normalization helpers, provider defaults, and the
Provider/Root context hooks and providers for advanced integrations.

### Safe areas and application chrome

Atom exposes the viewport element and its logical position but does not fix it,
choose an inset, or move it around application navigation. Apply placement in
the styled layer and combine the platform safe-area inset with an
application-owned offset:

```css
[data-slot="toast-viewport"] {
  --app-toast-inline-offset: 1rem;
  --app-toast-bottom-offset: 0px;

  position: fixed;
  inset-inline: var(--app-toast-inline-offset);
  bottom: calc(
    env(safe-area-inset-bottom, 0px) +
    var(--app-toast-bottom-offset) +
    1rem
  );
  z-index: 50;
}
```

For a persistent bottom bar, set `--app-toast-bottom-offset` to that bar's
occupied height. A custom portal container can instead establish local
coordinates for an embedded surface.

This recipe handles declared safe areas and application chrome; it does not
promise automatic software-keyboard or focused-control avoidance. Mobile
browsers expose keyboard geometry differently, and moving an announced stack
automatically can cause layout jumps. Compose a keyboard-aware offset in the
application only when its named-device behavior is verified.

## Examples

### Imperative toast

```tsx
import { Toast, toast } from "@flowstack-ui/atom";

export default function SaveToast() {
  return (
    <Toast.Provider>
      <button type="button" onClick={() => toast.success("Saved")}>Save</button>
      <Toast.Viewport />
    </Toast.Provider>
  );
}
```

### Declarative toast

```tsx
import { Toast } from "@flowstack-ui/atom";

export default function DeclarativeToast() {
  return (
    <Toast.Provider>
      <Toast.Root type="success">
        <Toast.Title>Saved</Toast.Title>
        <Toast.Description>Your changes were saved.</Toast.Description>
        <Toast.Close />
      </Toast.Root>
    </Toast.Provider>
  );
}
```

### Custom viewport rendering

```tsx
import { Toast } from "@flowstack-ui/atom";

export default function CustomToastViewport() {
  return (
    <Toast.Provider>
      <Toast.Viewport
        renderToast={({ toast: toastData, index, expanded }) => (
          <Toast.Root toast={toastData} index={index} expanded={expanded}>
            <Toast.Title />
            <Toast.Description />
            <Toast.Close />
          </Toast.Root>
        )}
      />
    </Toast.Provider>
  );
}
```

## Accessibility

Toast uses one persistent live-region path. Viewport announces ordinary,
success, info, and loading messages politely and warning/error messages
assertively. Visible cards remain ordinary interactive content, so the same
message is not announced twice. Meaningful title, description, or priority
updates announce once through the matching region.

Press `F8` while toasts are visible to focus the labelled notification region.
Focus within the region pauses finite timers. Escape dismisses the focused
dismissible toast, or the newest dismissible toast when focus is on the region,
then keeps focus in the region when another toast remains or restores the
element focused before hotkey entry. Toast appearance never moves focus.

Actions and cancel controls dismiss the toast after their callbacks run. Use
separate UI when an action must keep a toast open while async work completes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
