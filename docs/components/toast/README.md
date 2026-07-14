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
- Announces toast titles/descriptions through persistent live regions.
- Supports hover/focus-loss pause behavior.
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
| `closeButton` | `boolean` | `true` |
| `pauseOnHover` | `boolean` | `true` |
| `pauseOnFocusLoss` | `boolean` | `true` |

**ARIA:** Provider renders no element and adds no ARIA attributes.

**Data attributes:** Provider renders no element and exposes none.

### Root

Owns one toast's lifecycle, timer, pause state, dismissal callbacks, and live
announcement priority.

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

| ARIA attribute | Values |
| --- | --- |
| `role` | `"status"` normally; `"alert"` for warning and error |
| `aria-live` | `"polite"` normally; `"assertive"` for warning and error |
| `aria-atomic` | Always `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast"` |
| `[data-state]` | `"entering" \| "visible" \| "exiting"` |
| `[data-type]` | Toast type |
| `[data-index]` | Visible stack index |
| `[data-expanded]` | Present when expanded |

### Title

Provides the concise heading announced as part of the current Root.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Title adds no role or ARIA attributes; Root's live region announces it.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-title"` |

### Description

Provides supporting message text announced with Title inside the current Root.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Description adds no role or ARIA attributes; Root announces it.

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
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `portalDisabled` | `boolean` | `false` |
| `renderToast` | `(state: ToastViewportRenderState) => ReactNode` | - |

| ARIA attribute | Values |
| --- | --- |
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
functions, `useToastStore`, role/duration helpers, provider defaults, and the
Provider/Root context hooks and providers for advanced integrations.

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

Toast uses WAI-ARIA live-region semantics: Root uses `role="status"` with polite
announcements for ordinary messages
and `role="alert"`/assertive announcements for warning and error messages. The
viewport also maintains persistent hidden live regions so newly added toasts are
announced reliably.

Actions and cancel controls dismiss the toast after their callbacks run. Use
separate UI when an action must keep a toast open while async work completes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
