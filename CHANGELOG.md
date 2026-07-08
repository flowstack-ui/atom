# Atom Changelog

## Unreleased

- Fixed Popover positioning when `Anchor` uses its default `display: contents`
  wrapper by resolving the usable child element as the Floating UI reference
  and refreshing the reference after refs commit.
- Fixed non-modal and modal Popover dismissal so clicks and focus movement
  inside nested portalled Popover layers do not close the parent Popover.
- Fixed HoverCard render/default trigger positioning by updating Floating UI
  after the trigger ref commits, and made default/rendered triggers keyboard
  focusable while preserving focus-visible open behavior.
- Fixed Tooltip render trigger positioning by updating Floating UI after the
  trigger ref commits.
- Added `data-variant="plain|rich"` to Tooltip content and documented the
  `variant` Root prop.
- Fixed `ContextMenu.Trigger` so custom `data-slot` values override the
  default `context-menu-trigger` slot.
- Fixed Rating fractional pointer selection and RTL direction behavior for
  horizontal pointer and keyboard interactions.
- Fixed Combobox option selection so pointer clicks close consistently,
  `clearOnSelect` applies to every successful selection and free-solo Enter
  commit, and mounted empty states can open on focus.
- Fixed FileUpload read-only Trigger, Dropzone, and ItemDeleteTrigger parts so
  they expose `data-readonly` separately from disabled state, and documented
  the native HiddenInput attributes derived from Root and Field context.
- Fixed `Fieldset.Root` required semantics so it no longer emits invalid
  `aria-required`; required state remains exposed through context and
  `[data-required]`.
- Added `data-required` to `Input.Root` when required state is inherited from
  Field context or provided directly.
- Fixed Menu, DropdownMenu, and ContextMenu submenu keyboard behavior under
  `Direction.Provider dir="rtl"` so ArrowLeft opens submenus, ArrowRight closes
  submenus, and submenu placement mirrors to the left side.
- Fixed disabled native `ToggleGroup.Item` buttons so they rely on the native
  `disabled` attribute without adding redundant `aria-disabled`; non-native
  composed items still receive `aria-disabled`.
- Fixed disabled `ToggleGroup.Root` semantics so the group exposes
  `aria-disabled` alongside `data-disabled`.
- Fixed `ToggleGroup.Root` single mode so changing from multiple selected
  values exposes only one pressed item.
- Fixed `ToggleGroup.Item` roving focus for composed non-native items so
  disabled items are skipped consistently in `asChild` and `render` paths.
- Fixed `ToggleGroup.Item` collection registration so changing `asChild` or
  `render` composition refreshes the DOM node used for arrow navigation.
- Fixed `ToggleGroup.Root` horizontal arrow navigation so it mirrors
  ArrowLeft/ArrowRight when used under `Direction.Provider dir="rtl"`.
- Fixed disabled native `Toggle.Root` buttons so they rely on the native
  `disabled` attribute without adding redundant `aria-disabled`; non-native
  composed toggles still receive `aria-disabled`.
- Fixed custom-render `Pressable.Root` activation so pointer presses released
  outside the pressable target do not fire `onPress`.
- Fixed `Button.Root` `asChild` composition so non-native child elements
  receive button semantics and keyboard focus behavior.
- Fixed Collection duplicate item value warnings so browser development
  environments without `process.env.NODE_ENV` still report duplicate values.
- Fixed Slider percent geometry so `data-percent` and inline percent offsets do
  not expose floating-point artifacts such as `55.00000000000001`.
- Standardized typeahead matching across Menu, DropdownMenu, ContextMenu,
  Menubar, Select, Listbox, and Tree so single-character searches cycle from
  the current matching item while multi-character buffers still match exact
  prefixes.
- Fixed DropdownMenu pointer-open behavior so clicking the trigger opens
  without pre-highlighting the first item; keyboard Enter, Space, ArrowDown,
  and ArrowUp still seed the expected highlight.
- Fixed `ContextMenu.Trigger` so its documented `asChild` and `render`
  composition props are implemented while preserving context-menu behavior.
- Fixed `ContextMenu.Content` so refs forward to the underlying shared menu
  content element.
- Fixed ContextMenu pointer-open behavior so right-click opens without
  pre-highlighting the first item; keyboard context-menu opens still seed the
  first highlight.
- Fixed Menu/DropdownMenu pointer reopen behavior so closing animations cannot
  reapply the default first-item highlight for the next pointer open.
- Fixed Menubar pointer-open behavior so clicking or hovering between top-level
  menus opens content without pre-highlighting the first item; keyboard
  ArrowDown/ArrowUp still seed first/last highlight.
- Fixed shared autofocus behavior for portalled overlays so focus waits for
  delayed portal content to mount before moving into the overlay.
- Fixed Menu autofocus inside modal focus scopes so portalled content registers
  with the parent Dialog/Modal scope before focus moves into the menu.
- Fixed standalone Menu content labelling so `aria-labelledby` is only emitted
  when a trigger is mounted; standalone/context menus should use `ariaLabel`.
- Fixed nested Menu submenu item selection so child submenu clicks are not
  treated as outside clicks and selection closes the root menu.
- Fixed Menu submenu Escape handling inside parent overlays so Escape closes
  the topmost submenu before the root menu or parent Dialog/Modal layer.
- Fixed Menu submenu positioning so submenu content uses the mounted
  `SubTrigger` as its Floating UI reference when opened.
- Fixed Menu initial keyboard highlight so it waits for mounted items before
  marking the first highlight as applied.
- Fixed `Menu.Item` so its documented `asChild` and `render` composition props
  are implemented while preserving menuitem behavior, refs, and data attributes.
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
