# Modal Changelog

## Unreleased

- Prefer native Content ARIA while retaining `ariaLabel` compatibility, and
  preserve explicit native values over generated relationships.
- Register Title and Description parts with deterministic SSR hints and live,
  ref-counted hydration updates so generated IDs never dangle.
- Add interaction-aware `initialFocus` and `finalFocus` Content options,
  including touch-safe Content focus and controlled workflow restoration.
- Add a shared nested-modal layer stack and public `Modal.Branch` registration
  for consumer-owned portalled subtrees.
- Add metadata-aware focus containment without flattening Menu, Select,
  Popover, public Branch, and nested Dialog into one Tab sequence.
- Add per-document wheel/touch containment, registered portal scroll regions,
  fixed-body mobile locking, boundary blocking, and exact restoration.
- Isolate background subtrees with `inert` while preserving owned portal paths,
  dynamic branches, nested-modal ownership, and author-provided inert state.
- Limit custom modal portal containers to same-document `HTMLElement` nodes;
  ShadowRoot, DocumentFragment, and cross-document containers are unsupported.
- Establish modal activation and isolation before paint, and make exit-present
  closed Content inert and accessibility-hidden rather than modal.
- Preserve author `inert` changes during ownership, ref-count overlapping
  registrations, filter unavailable Tab candidates, and keep nested scroll-lock
  handoff continuously locked.

## 0.2.0

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent modal closes.
- Added scoped modal focus containment so focus that moves outside an active
  modal scope is restored inside the modal while registered portalled
  descendants remain valid focus targets.
- Treat `ariaLabel` passed to modal content helpers as the fallback accessible name by omitting the generated title reference when it is provided.

## 0.1.0

- Initial Atom release.
