# Atom Changelog

## 0.6.5

- Suppressed delayed compatibility hover and focus events after touch so
  HoverCard remains closed on Safari and tablet browsers even when pointer
  metadata is omitted.

## 0.6.4

- Made HoverCard hover interaction touch-safe while preserving native Trigger
  activation, and added a geometric pointer corridor between Trigger and
  Content to prevent flicker while crossing their visual gap.
- Prevented closing HoverCard Content retained for exit motion from reopening
  itself when the pointer crosses its fading hit area.

## 0.6.3

- Standardized HoverCard, Tooltip, and Popover collision priority so alternate
  alignments on the requested side and opposite side are exhausted before a
  perpendicular side is considered.
- Added tag-gated npm trusted publishing through GitHub Actions with OIDC,
  release metadata validation, complete package tests, archive verification,
  and React 18/19 consumer checks.

## 0.6.2

- Added perpendicular-axis collision fallbacks to HoverCard, Tooltip, and
  Popover so positioned content can choose an axis with sufficient viewport
  room instead of remaining cropped after an opposite-side flip.

## 0.6.1

- Corrected Tooltip touch dismissal so an outside touch or scrolling closes an
  opened post-release Tooltip immediately while preserving ordinary page input.

## 0.6.0

- Completed the CheckboxGroup family with deterministic Parent/select-all
  state from an explicit selectable-value set and structured ItemLabel and
  ItemDescription relationships that remain stable across server rendering and
  hydration.
- Added public direct, namespace, and checkbox-group subpath exports for the new
  parts plus semantic wrapper marking for styled libraries.
- Exposed disabled Checkbox state through `aria-disabled` consistently for the
  default button and custom composition targets.

## 0.5.3

- Removed invalid `aria-required` output from CheckboxGroup Root while
  preserving item semantics, required data state, and one-or-more native form
  validity.

## 0.5.2

- Added public Field and Fieldset semantic-part marking for styled wrapper
  libraries so generated naming and description relationships remain complete
  in server markup and hydration.

## 0.5.1

- Preserved server-rendered Field and Fieldset semantic-part relationships when
  Root composes one consumer wrapper through `asChild`, and corrected Form
  guidance to match observable rethrown callback failures.

## 0.5.0

- Reworked the form foundation so Field and Fieldset relationships are stable
  in server markup and hydration, grouped and single-value controls inherit the
  correct context, errors do not announce unless requested, and custom values
  follow native submission, validity, external-form, and reset behavior.
- Removed the remaining form-control `ariaLabel` compatibility props in favor
  of native `aria-label`, `aria-labelledby`, and `aria-describedby`; added
  Field/Fieldset integration to Checkbox, Switch, CheckboxGroup, RadioGroup,
  Combobox, NumberInput, Slider, Rating, Select, and OTPField.
- Preserved React function-action semantics in Form and stopped swallowing
  rejected Atom submit callbacks.

## 0.4.0

- Added Popover `Title` and `Description` parts with generated visible naming
  relationships, native ARIA naming, and no custom `ariaLabel` alias.
- Added interaction-aware Popover initial/final focus targets, touch-safe
  default focus, hover-without-focus-steal, and dismissal-aware restoration
  that preserves outside destinations.

## 0.3.5

- Corrected Tooltip touch sessions so stationary long press opens immediately
  at 700 ms, abandoned gestures cancel safely, and plain/rich dismissal begins
  only after release. Touch-generated compatibility events no longer turn a
  quick tap into hover/focus opening, and selection/callout suppression is
  limited to the active long-press gesture. Both variants remain
  non-interactive Tooltip content.

## 0.3.4

- Fixed shared scroll locking so body padding compensates only for viewport
  width actually released when locking. Pages using `scrollbar-gutter: stable`
  no longer shift when modal Dialog, AlertDialog, Drawer, Popover, or Menu
  content opens and closes.

## 0.3.3

- Corrected the pure-render Badge primitive and public `./badge` subpath to
  remain server-safe instead of declaring an unnecessary client boundary.
- Corrected Badge count guidance so generic inline content uses meaningful
  surrounding context and attached control counts belong to the owning
  control's accessible name or equivalent context.

## 0.3.2

- Fixed nested modal isolation cleanup so rapid layer handoffs and animated
  exits cannot leave the application root permanently `inert` after every
  dialog has closed.

## 0.3.1

- Fixed presence cleanup so exit-retained layers unmount after their computed
  transition or animation duration even when the browser does not emit a
  `transitionend` or `animationend` event. This prevents closed Dialog, Drawer,
  Popover, Menu, Tooltip, and similar layers from lingering over the page under
  global transition CSS. The fallback accounts for repeated CSS timing lists
  and animation iterations and ignores end events bubbled from descendants.

## 0.3.0

- Fixed Modal-family Content native `aria-label`, `aria-labelledby`, and
  `aria-describedby` forwarding so explicit native ARIA takes precedence while
  retaining `ariaLabel` as a compatibility fallback.
- Added SSR-safe, hydration-stable Title and Description registration so
  generated relationships are emitted only while their elements exist, and
  added settled development warnings for missing or duplicate relationships.
- Added Content-level `initialFocus` and `finalFocus` targets with opening and
  closing interaction details, native `autoFocus` support, touch-safe Content
  focus, controlled/triggerless restoration, and explicit workflow targets.
- Added a shared nested-modal layer stack so only the top layer owns focus,
  dismissal, and scroll containment, plus public `Modal.Branch` registration
  for consumer-owned third-party portals.
- Added metadata-aware focus containment so Menu, Select, Popover, public
  Branch, and nested modal layers preserve their own Tab contracts while focus
  cannot escape the active modal.
- Reworked modal scroll locking per document with wheel/touch boundary
  containment, registered portal allowances, fixed-body mobile locking, nested
  cleanup, and exact author style and scroll-position restoration.
- Added stack-aware background isolation with `inert`, preserving the ancestor
  paths to separate Content/Overlay portals, inline and custom-container
  content, dynamic owned branches, and the active nested modal while restoring
  author-provided inert state exactly.
- Limited Modal-family custom portal containers to same-document
  `HTMLElement` nodes; ShadowRoot, DocumentFragment, and cross-document
  containers are explicitly unsupported.
- Corrected Modal opening ownership to establish layer activation, isolation,
  focus containment, and body locking before paint; exit-present Content is now
  inert and accessibility-hidden after close.
- Preserved author `inert` mutations made during modal ownership, ref-counted
  overlapping focus/branch registrations, filtered unavailable Tab candidates,
  and kept nested scroll-lock handoff continuously locked without intermediate
  style or scroll restoration.
- Rejected Content beneath accessibility-hidden Dialog-family Overlays and
  limited backdrop dismissal to clicks targeted at the Overlay itself.

## 0.2.1

- Fixed `Button.Root` direct, `asChild`, and `render` link composition so
  anchors and inactive-safe link adapters retain native link semantics and
  keyboard behavior, while disabled or loading composed links lose their live
  navigation props and cannot activate. Router components that require a
  string `href` must use an inactive-safe render adapter.

## 0.2.0

- Fixed Tree pointer targeting so whitespace inside nested groups does not
  reactivate or select the parent item.
- Added `render` and `asChild` composition support to all Toolbar parts.
- Fixed Toolbar parts so custom `data-slot` values override their default slot
  identifiers.
- Added `Direction.Provider` and `dir` support to mirror `TreeGrid`
  horizontal cell navigation and expand/collapse arrow behavior in RTL.
- Added `Direction.Provider` and `dir` support to mirror horizontal `Tree`
  navigation and expand/collapse arrow behavior in RTL.
- Added `Direction.Provider` and `dir` support to mirror horizontal `DataGrid`
  cell navigation in RTL.
- Added `Direction.Provider` fallback for `Toolbar.Root dir` and rendered the
  resolved direction on the toolbar root.
- Added `Direction.Provider` and `dir` support to mirror horizontal `Tabs`
  ArrowLeft and ArrowRight navigation in RTL.
- Changed `Pagination.Previous`, `Pagination.Next`, `Pagination.Item`, and
  `Pagination.Ellipsis` to render their own structural `li` wrappers while
  keeping `asChild`, `render`, props, and refs targeted at the inner control or
  marker.
- Fixed local `Menubar.Root dir="rtl"` so nested submenu placement mirrors to
  the left, matching `Direction.Provider dir="rtl"`.
- Fixed adjacent top-level `Menubar` handoff so the active trigger keeps focus
  for `Enter`, `Space`, and `Escape` after ArrowLeft or ArrowRight navigation.
- Fixed custom `data-slot` overrides on `Menubar.Root` and `Menubar.Trigger`.
- Added horizontal trigger roving keyboard navigation for `NavigationMenu`,
  including RTL-mirrored ArrowLeft and ArrowRight handling.
- Added `Direction.Provider` fallback for `NavigationMenu.Root` direction.
- Added `Direction.Provider` and `dir` support to mirror `Menubar` top-level
  ArrowLeft and ArrowRight navigation in RTL.
- Changed `Breadcrumb.Root` to use the Atom-style `ariaLabel` prop for the
  breadcrumb navigation landmark label while still rendering native
  `aria-label`.
- Changed `BottomNavigation.Root` to use the Atom-style `ariaLabel` prop for
  its navigation landmark label while still rendering native `aria-label`.
- Fixed Accordion horizontal arrow-key navigation so it mirrors ArrowLeft and
  ArrowRight under `Direction.Provider dir="rtl"` or `Accordion.Root dir="rtl"`.
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
- Fixed `Toast.Viewport asChild` so the cloned viewport element receives
  generated queued toast content.
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
