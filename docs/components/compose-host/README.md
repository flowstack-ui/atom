# composeHost

Import `composeHost` from `@flowstack-ui/atom/compose-host` (or the root).
It applies owner props to one existing non-Fragment React element without a
wrapper. Custom children must forward props and refs to their real host.

```tsx
return composeHost(children, { ...props, ref });
```

The owner wins ordinary defined props. Undefined owner props preserve the
child value; classes concatenate and styles merge with owner precedence.
Both handlers run, owner first, including when the owner prevents default.
This is prop composition, not cancellable internal behavior. Use each
primitive's own event contract for cancellation.

Object and callback refs are composed. React 19 cleanup-returning refs retain
their cleanup; refs without cleanup receive null on detach. React 18 retains
its normal null-ref path. Preserve children by omitting an owner children prop;
an explicitly supplied children prop replaces them. Fragments and multiple
children are rejected. No roles, IDs, styles, state or client boundary are added.

Prefer a primitive's documented asChild/render path for existing behaviors.
This utility is for library-owned host adapters, not a replacement interaction
primitive. Do not import internal slot utilities.
