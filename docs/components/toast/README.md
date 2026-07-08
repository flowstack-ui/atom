# Toast

Toast provider, store, live announcements, viewport, and dismissible toast parts.

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

Configures toast viewport behavior for descendants.

| Prop | Type | Default |
| --- | --- | --- |
| `maxVisible` | `number` | `3` |
| `expandOnHover` | `boolean` | `true` |
| `closeButton` | `boolean` | `true` |
| `pauseOnHover` | `boolean` | `true` |
| `pauseOnFocusLoss` | `boolean` | `true` |

### Root

Toast message container.

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

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast"` |
| `[data-state]` | `"entering" \| "visible" \| "exiting"` |
| `[data-type]` | Toast type |
| `[data-index]` | Visible stack index |
| `[data-expanded]` | Present when expanded |

### Title

Toast title.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-title"` |

### Description

Toast description.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

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

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toast-viewport"` |
| `[data-position]` | Toast position |
| `[data-expanded]` | Present when expanded |
| `[data-slot="toast-announcer-polite"]` | Polite live region |
| `[data-slot="toast-announcer-assertive"]` | Assertive live region |

## Examples

### Imperative toast

```tsx
<Toast.Provider>
  <Toast.Viewport />
</Toast.Provider>

toast.success("Saved");
```

### Declarative toast

```tsx
<Toast.Provider>
  <Toast.Root type="success">
    <Toast.Title>Saved</Toast.Title>
    <Toast.Description>Your changes were saved.</Toast.Description>
    <Toast.Close />
  </Toast.Root>
</Toast.Provider>
```

### Custom viewport rendering

```tsx
<Toast.Viewport
  renderToast={({ toast: toastData, index, expanded }) => (
    <Toast.Root toast={toastData} index={index} expanded={expanded}>
      <Toast.Title />
      <Toast.Description />
      <Toast.Close />
    </Toast.Root>
  )}
/>
```

## Accessibility

Toast roots use `role="status"`/polite live announcements for ordinary messages
and `role="alert"`/assertive announcements for warning and error messages. The
viewport also maintains persistent hidden live regions so newly added toasts are
announced reliably.

Actions and cancel controls dismiss the toast after their callbacks run. Use
separate UI when an action must keep a toast open while async work completes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
