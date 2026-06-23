# Atom Changelog

## Unreleased

- Added shared dismissable layer Escape handling so nested overlays close the
  innermost open layer first instead of also closing parent Dialog, Drawer,
  Modal, Popover, Menu, Select, Combobox, HoverCard, Tooltip, or
  NavigationMenu layers.
- Fixed outside pointer dismissal for Menu, Menubar-backed menus, Select, and
  Combobox so clicks outside portalled content close reliably during
  inspection-heavy renders.
- Strengthened modal focus containment so Dialog, AlertDialog, Drawer, Modal,
  and modal Popover restore focus when it moves outside the active modal scope.
- Registered portalled Select, Menu, Menu submenus, and Popover content with the
  nearest focus scope so nested overlays remain valid focus targets inside
  modals.
- Added Field integration to Select so triggers inherit Field labels,
  descriptions, disabled state, and required state.
- Fixed Select keyboard opening so the intended initial highlight is applied
  after listbox items mount and `aria-activedescendant` stays in sync.
- Fixed Select closed-state typeahead so typing a matching character opens the
  listbox with the matching enabled item highlighted before items mount.
- Fixed Select value display so selected option labels resolve on initial
  closed render and remain stable after the listbox unmounts.
- Fixed Select trigger `asChild` composition so the trigger does not render a
  nested copy of its child.
- Fixed Menubar trigger semantics so top-level triggers expose `menuitem` roles
  inside `role="menubar"` containers.
- Scoped Menu radio item highlight identities to their parent radio group so
  separate groups can reuse the same public radio values.
- Fixed Menu highlight initialization so hovering section labels or gaps does
  not reset the active highlight back to the first menu item.

## 0.1.0

- Initial Atom release.
