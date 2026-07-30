# Playground Changelog

This changelog records meaningful tester- and maintainer-visible changes to the
repo-only Atom playground. Atom package behavior and API changes are recorded
separately in `../CHANGELOG.md` and the affected component changelogs.

## Unreleased

- Added a consolidated physical iOS/Android and VoiceOver/TalkBack candidate
  protocol while preserving every unrun device record as `not run`.
- Added desktop/mobile positioned-overlay regressions for Combobox and Dropdown
  Menu, including the documented Menu available-height overflow recipe and
  portrait-to-landscape resize.
- Added Android/iPhone browser regressions for actionable Toast placement with
  consumer safe-area/application offsets and focused-input preservation.
- Consolidated mobile Tooltip, Context Menu, Slider, Rating, and Swipeable Item
  gesture/cancellation regressions across Chromium and WebKit touch profiles.
- Reconciled all 78 Mobile Readiness workbook records with the final protocol,
  linked applicable automated evidence, and corrected validation so an
  unavailable unrun device is structurally ready without being marked passed.

- Clarified the Toast mobile-readiness contract with a public safe-area and
  application-offset recipe; automatic virtual-keyboard avoidance remains a
  named-device experiment rather than a package claim.

- Added desktop and mobile browser regressions for modal Dropdown Menu and
  Popover background isolation, internal wheel/touch scrolling, scroll-boundary
  containment, and cleanup.

- Added desktop Chromium/WebKit and Android/iPhone touch regressions for
  release-based Combobox and Dropdown Menu outside dismissal.

- Added a shared Playwright scenario helper, desktop Chromium/WebKit projects,
  Android-Chromium and iPhone-WebKit touch profiles, and initial mobile Dialog
  and Select smoke journeys. CI and publishing now install both browser engines.

- Updated the locked PostCSS toolchain to a patched compatible release so the
  playground dependency audit is clean.

- Added permanent Swipeable Item browser and manual evidence for horizontal
  reveal, cancellation, vertical-scroll preservation, descendant keyboard
  isolation, logical direction, and action closing.

- Updated Tree defaults and its manual protocol for selected-item initial
  focus and bounded arrow navigation, with wrapping retained as an opt-in.

- Updated the Data Grid workbench and manual protocol with live sortable-header
  pointer/Enter action evidence and generated Source.

- Updated Pagination Canvas, Source, Anatomy evidence, and its manual protocol
  for generated `Items` and Root-level accessible-label localization.

- Expanded Bottom Navigation with explicit `always`, `active`, and `hidden`
  label-visibility policies plus `static`, `sticky`, `absolute`, and `fixed`
  positioning intent across Canvas, Source, Anatomy, Inspector, workbook
  coverage, and the focused manual protocol.

- Added live Root and Content `asChild`/`render` controls to the Menubar
  workbench so the corrected composition contract is visible in Canvas,
  Source, Anatomy, and Inspector evidence.
- Reconciled Menu, Dropdown Menu, Context Menu, Menubar, and Navigation Menu
  workbook coverage with the hardened real-focus, complete-owner Tab exit,
  disabled-item, shared anatomy, mixed-state, long-press, pointer-modality,
  geometry, vertical-orientation, and reflow contracts. Prior unrelated manual
  evidence is preserved; 96 affected or new rows are reopened until the
  updated protocols and named browser/device matrix pass.

- Expanded Radio Group with group-level read-only controls, inspected state,
  generated Source, and focus-preserving selection-lock evidence.

- Added a dedicated Image workbench for loaded, broken, and absent sources,
  informative and decorative alternatives, native image attributes, public
  anatomy, composition, inspected state, transition logs, workbook coverage,
  and a focused manual protocol.
- Added a dedicated Clipboard workbench with editable controlled and
  uncontrolled values, disabled behavior, simulated success and rejection,
  truthful pending/success/error feedback, timeout reset, all public anatomy,
  inspected output, event history, workbook coverage, and a draft protocol.
- Added a dedicated Link workbench for native anchors, current-state
  passthrough, router-shaped `render`/`asChild` composition, native attributes,
  Link-versus-Button semantics, inspected output, and a focused draft manual
  protocol.
- Reopened disabled Toolbar Link evidence for the corrected destination-free
  output contract.
- Added Form Foundation evidence for automatic inline/native constraint
  presentation, visible invalid state, Error relationships, correction, reset,
  and group-level required validation introduced in Atom `0.6.13`.
- Expanded Checkbox Group with the complete Parent/select-all and structured
  ItemLabel/ItemDescription anatomy, live mixed-state and relationship
  inspection, disabled-value handling, matching Source, and a draft focused
  desktop/mobile manual protocol.
- Updated the form-control scenarios and generated Source examples for the
  native-ARIA-only form API. Added coverage for Field/Fieldset inheritance,
  server-stable descriptions, native submission and required validity, and
  uncontrolled reset behavior. Atom `0.5.0` shipped from automated
  qualification; the new manual rows remain open for the owner's later QA.
- Expanded Popover with visible Title/Description relationship evidence,
  opening/closing reason logs, a real text-input touch-safety target, explicit
  initial/final focus targets, hover-without-focus-steal checks, and
  outside-destination preservation. Naming examples use native `aria-label`
  and expose no custom Popover alias.
- Expanded Tooltip touch evidence with `touchmove` and `touchcancel` logs plus
  a reviewed protocol for the exact long-press threshold, abandon paths,
  release-based plain/rich dismissal, compatibility-event suppression,
  touch-scoped selection/callout handling, scroll preservation, and desktop
  regressions.
- Corrected the Badge numeric-content scenario so its count has visible
  surrounding context in both Canvas and Source instead of presenting an
  unexplained generic `span`.
- Standardized local playground development on port `3000`, added the matching
  LAN command for phone/tablet review, reserved preview port `4000`, and made
  port collisions fail instead of silently selecting another port.
- Expanded the Dialog scenario for native versus compatibility naming,
  optional Description relationships, explicit initial/final focus targets,
  consumer-owned `Modal.Branch` portals, background inert evidence, portalled
  Select integration, and nested modal ownership qualification.

## 1.0.0 - 2026-07-14

- Established the completed Atom browser workbench baseline with consistent
  Anatomy, Canvas, Inspector, Logs, and Source surfaces.
- Added component coverage tracking and reviewed, version-controlled Manual
  Test Protocols.
- Added live DOM, ARIA, data-attribute, focus, and selection evidence for manual
  browser verification.
- Established public Atom imports with local source resolution so scenarios
  exercise the consumer-facing API against the current workspace source.
