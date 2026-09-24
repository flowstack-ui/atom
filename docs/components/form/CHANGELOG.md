# Form Changelog

## Unreleased

- Preserve the accepted submit callback's form target after asynchronous
  validation without mutating React's dispatched event.

- Cancel queued uncontrolled reset callbacks on unmount or form reassociation,
  while keeping the latest callback during ordinary rerenders.

- Callback state is owned by the latest submission attempt. Reset or unmount invalidates earlier pending completions; requests themselves remain application-owned. React function-action pending state remains React-owned.

## 0.6.17

- Kept explicit inline validation focus scrolling safe in non-browser DOM
  implementations that omit `scrollIntoView`.

## 0.6.16

- Explicitly scrolled inline validation's first invalid visible control into
  view after focusing it.

## 0.6.15

- Marked the first invalid control focused by inline validation with
  `[data-focus-visible]` until blur so styled layers can expose the focus move.

## 0.6.13

- Added inherited inline/native validation presentation and aggregate
  descendant invalid state without disabling native constraints.

## 0.5.0

- Preserved native and React function-action submission paths, kept React action
  pending state with `useFormStatus`, and stopped swallowing rejected Atom
  submit callbacks while retaining resettable Atom callback metadata.
## 0.1.0

- Initial Atom release.
