# Atom Changelog

## Unreleased

## 0.23.1 - 2026-08-28

- Added an export-led Agent Knowledge catalog and deterministic coverage report
  that classify every public subpath and symbol, validate structured selection
  destinations, reject stale generated output, and verify the same complete
  discovery surface from the packed installed package before publication. All
  Agent Knowledge build, archive, and installed-consumer paths now enforce the
  closed 69-owner catalog with zero coverage failures.
- Embedded original TypeScript sources in published JavaScript maps so package
  consumers can inspect and bundle Atom without missing-source warnings.
- Kept collapsible NavList section content mounted through styled exit motion,
  exposed measured content-size hooks, and suppressed entrance animation for
  initially open sections.
- Kept Popover open while focus or pointer interaction moves into portalled
  Atom controlled layers opened from its Content, including Dropdown Menu,
  including browser focus transitions through the document during modal setup.

## 0.23.0 - 2026-08-21

- Added headless `DragDrop` behavior for labelled same-document sources and
  targets, mouse/pen/touch and keyboard movement, invalid-release
  cancellation, RTL-aware targeting, and localizable announcements.
- Added the controlled `Reorder` ordered-collection preset with stable item
  identities, before/after movement, focus continuity, and visible
  Move-before/after/start/end alternatives that do not require dragging.
- Added native URL-backed Pagination through `Root.getPageHref`, rendering
  Item, Previous, and Next as real anchors while preserving button mode,
  current-page semantics, browser navigation, and inert boundary controls.

## 0.22.6 - 2026-08-10

- Kept the pure-render Divider primitive and explicit subpath server-safe for
  React Server Component consumers.
- Added public Agent Knowledge for Accordion and List and routed both from the
  package-level selection and behavior-composition guides.

## 0.22.5 - 2026-08-08

- Kept Carousel's initial active slide aligned after hydration by scrolling
  only its own viewport instead of delegating to `scrollIntoView()`.

## 0.22.4 - 2026-08-08

- Made Carousel looping continue in the requested direction from last to first
  and first to last without cloning authored slide content, IDs, controls, or
  form fields, including DOM-like environments without `requestAnimationFrame`.

## 0.22.3

- Made Carousel rotation-control activation independent of browser-specific
  focus/click timing so pointer users reliably stop or start rotation in
  Chromium, Firefox, and WebKit while keyboard focus still stops rotation.

## 0.22.2

- Made the Carousel viewport keyboard-focusable by default so its native
  horizontal scroll region remains operable in Safari and satisfies the
  scrollable-region accessibility contract.

## 0.22.1

- Fixed the Carousel rotation control so pointer focus and the following click
  complete one stop action instead of immediately restarting rotation.

## 0.22.0

- Added the headless one-active-slide Carousel family with controlled and
  uncontrolled selection and automatic rotation, optional Previous, Next,
  grouped picker and rotation controls, native touch-scroll selection,
  focus/hover/visibility pause policy, LTR/RTL support, public behavior state,
  documentation, and Agent Knowledge.

## 0.21.0

- Centered Navigation Menu's horizontal Viewport on its active trigger and
  added collision-aware visual-viewport geometry, configurable padding, and
  public resolved-position variables for styled connector alignment.

## 0.20.12

- Added package-level layer-selection and behavior-composition Agent Knowledge,
  plus navigation and structural guidance for AppBar, Breadcrumb, Bottom
  Navigation, Divider, Drawer, Image, Navigation Menu, Nav List, Pagination,
  Scroll Area, Sidebar, Skip Link, Tabs, and Toolbar.
- Extended the agent manifest with a backward-compatible `guides` collection
  and validated `flowstack.agent-guide.v1` artifacts.
- Added repository-owned verification metadata, stale test-port diagnostics,
  non-reusing Playwright previews, parallel browser CI, nightly release
  qualification, and exact-archive distributed publication checks.
- Added a consumer-first npm README and packaged getting-started, import, and
  public-API guides while keeping repository-only guidance out of the archive.

## 0.20.11

- Kept a Navigation Menu trigger open when the same mouse movement that
  hover-opens it is immediately followed by a click, preventing cross-browser
  open-then-close races when switching triggers.

## 0.20.10

- Exposed Navigation Menu active-trigger geometry variables on Viewport as
  well as Indicator so styled vertical menus can keep both surfaces aligned,
  including when Viewport uses an authored positioning wrapper.

## 0.20.9

- Exposed initially open Accordion and Collapsible Content with
  `data-initial-open` until its first state transition so styled layers can
  suppress page-load entrance motion without disabling interactive motion.

## 0.20.8

- Measured newly opened Accordion and Collapsible content before its first
  painted animation frame so styled height transitions begin from a stable,
  available intrinsic size.

## 0.20.7

- Kept an open ContextMenu custom on repeated or cross-target secondary clicks,
  repositioned it from the latest invocation coordinate, and prevented the
  browser menu from replacing it.
- Made an activation outside a complete Menu subtree dismiss the root and its
  open submenu in one step while preserving submenu-only dismissal inside the
  parent surface.

## 0.20.6

- Required actual mouse movement before hover-opening a Menu submenu so a
  newly positioned parent menu cannot open a submenu beneath a stationary
  pointer.

## 0.20.5

- Preserved Menu and submenu direction across portal boundaries so
  DropdownMenu and ContextMenu logical layout agrees with their trigger,
  explicit `dir`, or Direction provider.
- Allowed nested menus to use block-axis collision fallbacks and final
  cross-axis shifting instead of overflowing narrow viewports when neither
  inline side fits.

## 0.20.4

- Preserved Select's resolved LTR/RTL direction across its portal boundary so
  logical `start` alignment and option content follow the trigger direction.

## 0.20.3

- Kept sticky application chrome anchored at its existing viewport position
  while Dialog, Drawer, AlertDialog, modal Popover, and modal Menu-family
  layers lock background scrolling.

## 0.20.2

- Allowed native focus scrolling when Combobox Trigger returns focus to Input,
  so mobile browsers can reveal the control above the virtual keyboard.
- Added focused public-subpath test commands and explicit focused, repository,
  and release verification tiers without changing package runtime behavior.
- Fixed the release verification orchestrator so the release tier runs the
  repository, browser, archive, and consumer checks without recursively
  invoking itself.

## 0.20.1

- Kept Menu and submenu available-size and trigger-size CSS variables stable
  across Floating UI positioning rerenders so consumer overflow constraints
  continue working in short and resized viewports.
- Made modal Popover use Atom's stacked background-isolation system so its
  `aria-modal` semantics now match its focus and scroll containment; non-modal
  Popover behavior is unchanged.
- Documented consumer-owned modal scrolling, mobile menu presentation, and
  Toast safe-area/application offsets without adding styling or automatic
  virtual-keyboard behavior to the headless package.

## 0.20.0

- Added the public `useOutsideInteraction` hook and preventable
  `onInteractOutside` contract for Combobox, Select, MultiSelect, Menu-family,
  and Popover content.
- Changed those primitives to commit outside dismissal on completed
  click/activation semantics through a topmost-layer stack, rejecting drags,
  boundary crossings, cancellation, secondary buttons, and multi-pointer
  sessions while preserving the destination activation.
- Deprecated `useClickAway`; it remains available for compatibility.

## 0.19.9

- Made SwipeableItem preserve native vertical panning and stopped nested
  controls' Arrow keys from being interpreted as item-reveal commands.

## 0.19.8

- Made Feed keyboard navigation reveal the focused article or outside-feed
  target with nearest scrolling while preserving consumer cancellation.

## 0.19.7

- Fixed FileUpload Field relationships on its visible Trigger, made pre-drop
  accept/reject state reflect configured constraints, and prevented accidental
  file drops on the surrounding document by default.

## 0.19.6

- Fixed Rating drags so a pointer captured by the starting item can continue
  selecting across every item in the scale.

## 0.19.5

- Stabilized Rating pointer selection: repeated activation no longer clears by
  default, `allowClear` opts into clearing, and capture loss finalizes the live
  value while true cancellation still rolls back.

## 0.19.4

- Fixed Slider clicks and drags that could jump back when browsers released
  pointer capture during an otherwise valid interaction. True pointer
  cancellation still restores the initial value.

## 0.19.3

- Corrected range Slider thumb ARIA bounds to reflect adjacent-thumb and
  minimum-gap constraints.
- Made Slider and Rating pointer sessions single-owner, axis-scroll-safe, and
  reversible when pointer interaction is cancelled or capture is lost.

## 0.19.2

- Removed unsupported `aria-required` from the OTP Field group while
  preserving required semantics and native validity on its visible cells.

## 0.19.1

- Fixed Password Toggle Field to inherit Field-generated label, description,
  error, and control-ID relationships.

## 0.19.0

- Made Field inherit containing Fieldset state and validation behavior and
  report its aggregate validity through Fieldset before Form.
- Added compound NumberInput Input, Increment, and Decrement parts with owned
  spinbutton relationships, limit state, and pointer-focus preservation.
- Added localizable generated OTP cell labels and state-aware PasswordToggleField
  show/hide action labels.
- Restored password input type before native submission and reset uncontrolled
  password visibility with its form.

## 0.18.2

- Added Combobox Control and Trigger parts so the complete visible control owns
  popup geometry and the disclosure affordance has native button behavior.
- Made authored Combobox Items follow the Root filter automatically and derive
  initial display text from an uncontrolled default selection.
- Mirrored open, disabled, read-only, required, and invalid state onto the
  Combobox Control for standalone and Field-composed styling.

## 0.18.1

- Made Combobox touch and pen outside dismissal wait for a completed tap and
  cancel when the pointer moves, scrolls, or is cancelled.

## 0.18.0

- Added TreeGrid actionable sortable headers and corrected collapsed-branch
  active-descendant relocation.

## 0.17.1

- Corrected Tree initial focus to honor visible selection and changed its
  default arrow navigation to stop at collection boundaries.

## 0.17.0

- Added DataGrid `ColumnHeader.onAction` so sortable headers receive equivalent
  pointer and active-header Enter activation without moving sorting logic into
  Atom.

## 0.16.0

- Added Pagination `Items` range composition and Root-level localization for
  generated page, Previous, and Next accessible labels.

## 0.15.0

- Expanded Toast with exactly-once persistent announcements, logical
  positioning, notification-region keyboard access, focus pause and Escape
  restoration, directional swipe behavior, safe option normalization, stable
  update IDs, and correct Provider close inheritance.

## 0.14.0

- Added complete vertical/horizontal orientation metadata and live two-axis
  measurement for Collapsible and Accordion Content.
- Corrected Accordion non-collapsible open Trigger semantics while keeping it
  focusable, and added optional Content landmark suppression.

## 0.13.1

- Kept Collapsible and Accordion `--content-height` synchronized with live
  responsive and intrinsic content resizing so styled height animations do not
  close from stale measurements.

## 0.13.0

- Expanded BottomNavigation with explicit always/active/hidden label-visibility
  policy and static/sticky/absolute/fixed positioning intent while preserving
  the deprecated `showLabels` compatibility path.

## 0.12.1

- Fixed Menubar Root and Content composition so styled consumers can change
  their rendered elements without losing Menubar behavior or native props.

## 0.12.0

- Hardened Menu, DropdownMenu, ContextMenu, and Menubar around real DOM item
  focus, disabled-item navigation, reason-aware close/final focus, correct
  composite Tab exit, stacked modality, and touch-safe outside dismissal.
- Added shared Menu Portal, Arrow, Label, and ItemIndicator parts, mixed
  checkbox state, complete retained-part composition, and collision-aware
  geometry variables.
- Added ContextMenu touch/pen long press and vertical Menubar orientation.
- Prevented touch/pen from running submenu, Menubar, or NavigationMenu hover
  timers while preserving click/tap disclosure.

## 0.11.1

- Made explicit RadioGroup Root `dir` override Direction context for horizontal
  arrow-key mapping while remaining on the rendered group.

## 0.11.0

- Added RadioGroup group-level read-only semantics and selection locking while
  preserving focus navigation and native form submission.

## 0.10.1

- Moved MultiSelect `aria-required` and `aria-readonly` from its native button
  trigger to the multiple-selection listbox roles that support those states.

## 0.10.0

- Added the headless MultiSelect compound primitive with array selection,
  button-owned multi-select listbox semantics, focus and keyboard behavior,
  positioning, dismissal, summary rendering, and Field/Form participation.

## 0.9.3

- Fixed Select Arrow's public TypeScript props to accept the decorative
  children already supported by its rendered span.

## 0.9.2

- Made tagged publication retry-safe and added automatic GitHub Release
  creation after successful npm publication.
- Made Select touch/pen outside dismissal gesture-safe and added
  collision-aware Arrow positioning with resolved side/alignment state.

## 0.9.1

- Fixed List Root's public TypeScript declarations so documented native
  ordered-list `start` and `reversed` attributes are accepted.

## 0.9.0

- Added the generic headless Image primitive with source loading state and
  conditional Content/Fallback anatomy.

## 0.8.0

- Added the headless Clipboard compound primitive with controlled and
  uncontrolled text, native Label/Input relationships, truthful asynchronous
  copied/error state, timeout reset, stale-operation protection, authored live
  feedback, and a public `clipboard` subpath.

## 0.7.0

- Added a server-safe native Link primitive and public `link` subpath with
  native anchor attributes and router composition through `render` and
  `asChild`.
- Made disabled Toolbar links omit direct and composed destination attributes
  instead of leaving an unavailable `href` live.

## 0.6.17

- Preserved explicit validation-focus scrolling in browsers while tolerating
  non-browser DOM implementations that do not provide `scrollIntoView`.

## 0.6.16

- Made inline validation focus explicitly scroll its visible target into view,
  avoiding real-device Safari failures where programmatic focus and its visible
  indicator were applied without revealing the invalid control.

## 0.6.15

- Exposed validation-directed focus through `[data-focus-visible]` until blur,
  allowing styled consumers to render a visible focus indicator after pointer
  as well as keyboard submission.

## 0.6.14

- Added touched validation presentation for required Checkbox and CheckboxGroup:
  invalid state now appears after leaving an empty control or removing its last
  required selection, clears on correction, and returns to untouched on reset.

## 0.6.13

- Added shared `validationBehavior="inline" | "native"` presentation policy
  across Form, Field, Fieldset, and every native-validity-owning Atom control.
- Mirrored attempted native constraint failures to visible controls and their
  Field, Fieldset, and Form state, with correction/reset cleanup and
  first-invalid visible focus in inline mode.
- Made compatible Field and Fieldset Error parts automatically select inline
  presentation while retaining native constraints, invalid submission
  blocking, and explicit control-level overrides.

## 0.6.12

- Aligned native constraint-validation controls with their visible composite
  owners across Checkbox, CheckboxGroup, Switch, RadioGroup, Select, Combobox,
  Rating, and FileUpload, including correct validation without a submission
  name and focus redirection to the operable control.
- Moved OTPField required validity to its first visible cell while retaining a
  submission-only combined named value.
- Synchronized accepted FileUpload files back to the native file input when
  the browser permits programmatic `FileList` assignment, keeping drag/drop,
  native required validity, and FormData consistent.

## 0.6.11

- Restored native required constraint validation for Checkbox and
  CheckboxGroup by keeping their controlled hidden checkbox inputs eligible
  for browser validation while visible read-only controls remain non-editable.

## 0.6.10

- Kept Popover open during touch and pen scrolling by deferring outside
  dismissal until a gesture resolves as a tap, while preserving immediate
  mouse dismissal.

## 0.6.9

- Preserved explicit, trigger/anchor-inherited, and provider direction across
  portalled Popover, HoverCard, and Tooltip Content so logical placement and
  DOM layout remain RTL-correct.

## 0.6.8

- Exposed measured available dimensions on Tooltip, HoverCard, and Popover
  Content through headless `--atom-floating-available-*` properties.
- Added an internal Popover viewport so styled layers can constrain and scroll
  interactive content without clipping the sibling Arrow.

## 0.6.7

- Replaced fixed-body modal scroll locking with document-root and body overflow
  locking, preserving scroll coordinates and avoiding iOS Safari browser-chrome
  transitions when Dialog, AlertDialog, Drawer, modal Popover, or modal Menu
  opens and closes.

## 0.6.6

- Prevented touch-only browsers from installing HoverCard hover opening and
  captured touch modality before compatibility `mouseenter` on hybrid devices,
  eliminating the remaining zero-delay edge-tap race.

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
