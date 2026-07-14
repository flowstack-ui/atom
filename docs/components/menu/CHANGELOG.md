# Menu Changelog

## Unreleased

- Fixed Menu part `data-slot` pass-through so Content, Group, Separator,
  CheckboxItem, RadioGroup, RadioItem, SubTrigger, and SubContent can be
  overridden consistently.
- Fixed submenu keyboard behavior under `Direction.Provider dir="rtl"` so
  ArrowLeft opens submenus, ArrowRight closes submenus, and submenu placement
  mirrors to the left side.
- Standardized Menu typeahead so a single-character search cycles from the
  current matching item while multi-character buffers still match exact
  prefixes.
- Added support for no initial Menu highlight so composed patterns such as
  Menubar can open from pointer input without pre-highlighting the first item.
- Fixed pointer reopen behavior so closing presence frames cannot reapply the
  default first-item highlight for the next pointer open.
- Fixed autofocus for portalled Menu content that mounts after the Menu opens,
  including controlled menus rendered inside Dialog.
- Fixed Menu autofocus inside modal focus scopes so portalled content registers
  with the parent Dialog/Modal scope before focus moves into the menu.
- Fixed standalone content labelling so `aria-labelledby` is only emitted when a
  trigger is mounted; standalone/context menus should use `ariaLabel`.
- Fixed nested submenu item selection so child submenu clicks are not treated
  as outside clicks and selection closes the root menu.
- Fixed submenu Escape handling inside parent overlays so Escape closes the
  topmost submenu before the root menu or parent Dialog/Modal layer.
- Fixed submenu positioning so `SubContent` uses the mounted `SubTrigger` as
  its Floating UI reference when opened.
- Fixed Menu initial keyboard highlight so it waits for mounted items before
  marking the first highlight as applied.
- Fixed `Menu.Item` so its documented `asChild` and `render` composition props
  are implemented while preserving menuitem behavior, refs, and data attributes.
- Added shared dismissable layer Escape handling so Menu closes before parent
  overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Fixed outside pointer dismissal so Menu and Menubar-backed menus close
  reliably when clicking outside portalled content during inspection-heavy
  renders.
- Registered portalled Menu content and submenu content with parent modal focus
  scopes so menus can remain valid focus targets inside Dialog, Drawer, and
  other modal primitives.
- Scoped `RadioItem` highlight identities to their parent `RadioGroup` so
  separate radio groups can reuse the same public item values in one menu.
- Fixed initial highlight behavior so pointer movement over non-item content or
  item gaps does not reset highlight back to the first item while a menu is
  already open.
## 0.1.0

- Initial Atom release.
