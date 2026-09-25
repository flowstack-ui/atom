# OverlayManager

Import `createOverlay` from `@flowstack-ui/atom/overlay-manager`.
Create a manager for an authored overlay component and mount its `Viewport`
under application providers before calling `open(id, props)`.

## Anatomy

Viewport renders keyed instances without a wrapper. Authored overlays still
provide their native parts, Portal, accessible names and focus behavior.

## API Reference

`createOverlay<P, R>(Component)` returns Viewport, open, close, update, remove,
removeAll, has, get, getSnapshot and waitForExit. Component receives authored P
and manager-owned open, onOpenChange(boolean), onExitComplete. Forward those
three props to a supported overlay Root. Do not use them in authored P.

open returns the typed result or undefined on dismissal/removal. close returns
an exit promise; waitForExit can be called before closure. Repeated open on an
open ID updates props and returns its existing promise. Reopening an exiting ID
creates a fresh generation. update accepts partial authored props and preserves
child state. Missing get/update IDs throw; missing close/remove are no-ops.
getSnapshot returns stable readonly entries containing id, props and open.
remove/removeAll skip animation and settle all pending work. Permanent host
unmount also cancels outstanding instances; StrictMode replay does not.

The result settles when closure is requested, not when React commits the closed
state. If an instance closes before its first open commit (including suspended
content), there is no visual exit: the manager removes it after the current
commit opportunity and settles its exit promise. Once an open instance commits,
exit completion remains owned by its overlay. A stale exit cannot remove a
replacement generation.

`get` and `getSnapshot` are imperative reads, not reactive hooks. Use application
state for UI that displays manager activity. Put default authored props in the
overlay component; this factory does not accept an options/default-props object.

## Accessibility

The authored overlay owns focus, Escape, isolation, naming and restoration.
Mount Viewport under the required locale and theme contexts. Specify a valid
final focus target when the initiating menu item disappears. There is no
manager-owned focus trap or modal policy. Construct request-scoped managers
for server applications; never mutate a shared server instance during render.

## Data Attributes

The manager renders no host and adds no data attributes. The authored overlay
retains its own data attributes and native props.
