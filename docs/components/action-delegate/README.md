# ActionDelegate

Import `ActionDelegate` from `@flowstack-ui/atom/action-delegate`. It merges
handlers onto exactly one child host; no wrapper, role, tab stop or styling.

```tsx
<ActionDelegate targetId="order-42">
  <tr><td><a id="order-42" href="/orders/42">Order 42</a></td></tr>
</ActionDelegate>
```

## Behavior

`targetId` is required. `disabled` defaults to false. `children` is one
non-Fragment React element. Forwarded ref points to that element's host.
Keep the primary control visible, enabled and accessible inside the host.
Supported targets are real links, buttons and native checkbox inputs. Ordinary
background clicks activate the target; direct target clicks execute normally.
Keyboard users use the actual control. No row keyboard behavior is introduced.

## Accessibility

Independent controls, labels, editable content, cancelled/default-prevented
events, text selection, portal-origin events, drag and modified/nonprimary
clicks do not delegate. Use `data-action-delegate-ignore` for unusual custom
interactive descendants. Do not nest delegates. Native link affordances remain
on the link; blank region modifier/middle/context-menu navigation is not supplied.

## Data Attributes

Enabled hosts expose `data-action-delegate`; all hosts expose
`data-action-delegate-boundary`. These state hooks contain no visual styling.
Missing/invalid targets no-op and warn in development. This is not Pressable:
it does not assign button semantics to the host. User data, navigation and
business operations remain application-owned.
