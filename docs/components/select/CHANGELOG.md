# Select Changelog

## 0.6.12

- Aligned the native select with Trigger and redirected browser validation
  focus, including required Selects without a submission name.

## 0.5.0

- Added complete Field invalid/read-only integration, native-only Trigger and
  Listbox naming, uncontrolled reset, and a visually hidden native select for
  submission and required constraint validation.

## 0.2.0

- Fixed Select part `data-slot` pass-through so Value, Icon, Content/Listbox,
  Viewport, Group, Label, Item, ItemText, ItemIndicator, Separator, Arrow, and
  scroll buttons can be overridden consistently.
- Standardized Select typeahead so a single-character search cycles from the
  current matching option while multi-character buffers still match exact
  prefixes.
- Added shared dismissable layer Escape handling so Select closes before
  parent overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Fixed outside pointer dismissal so Select closes reliably when clicking
  outside the trigger or listbox during inspection-heavy renders.
- Fixed value display so selected option labels resolve on initial closed
  render and remain stable after the listbox unmounts.
- Fixed trigger `asChild` composition so the trigger does not render a nested
  copy of its child.
- Fixed keyboard opening so `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`,
  and `Space` apply the intended initial highlight after portalled listbox
  items mount, keeping `aria-activedescendant` in sync.
- Fixed closed-state typeahead so typing a matching character opens the listbox
  with the matching enabled item highlighted before items mount.
- Registered portalled Select content with parent modal focus scopes so Select
  can remain a valid focus target inside Dialog, Drawer, and other modal
  primitives.
- Added Field integration so `Select.Trigger` inherits Field labels and
  descriptions while `Select.Root` inherits Field disabled and required state.
- Refined `Select.Trigger` keyboard handler dependencies to avoid recreating callbacks from the full context object.

## 0.1.0

- Initial Atom release.
