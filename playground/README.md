# Atom Playground

The playground is a local browser workbench for testing Atom primitives from the
current source code. It is not package documentation and it is not part of the
npm package.

## Goal

Use the playground to catch browser behavior that package tests cannot fully
show:

- focus movement and focus restoration
- Escape, arrow key, Enter, Space, and Tab behavior
- portal and overlay behavior
- controlled and uncontrolled state
- form participation
- live `aria-*` and `data-*` state
- pointer and keyboard interaction together

Package tests remain the release gate for exact contracts. The playground is
for real browser confidence and manual exploration.

## Source Rule

Use public Atom import paths only:

```tsx
import { Dialog } from "@flowstack-ui/atom";
import { Select } from "@flowstack-ui/atom/select";
```

The Vite config maps those imports to `../src`, so the playground exercises the
current local source without installing the published npm package.

Do not import from `../src/primitives`, `../src/utils`, or other internal paths.

When the workbench needs UI, dogfood Atom primitives before writing custom
behavior. Current shared workbench UI uses:

- `AppBar` for the top application bar
- `Menubar` for the category menu and scenario toolbar menus
- `Button` for header actions and imperative test actions
- `Collapsible` for Anatomy groups
- `Tabs` for Inspector target switching
- `ScrollArea` for scrollable Log content
- `Field`, `Input`, and `Select` inside live form scenarios

## App Shape

Build the playground like a small desktop-style tool.

- Use a top `AppBar` with a `Menubar` for scenario categories.
- Use dropdown menus for component categories directly in the top bar.
- Use nested submenus only when a category needs them.
- Do not add a persistent sidebar.
- Keep the main area focused on the selected scenario.
- Put scenario prop controls in the Canvas toolbar when they affect the live component.
  The Canvas toolbar is an Atom `Menubar`, not a long row of loose toggles.
- Show the current package name and version on the right side of the top bar.
- Put imperative panel actions in card headers, such as `Focus Canvas`,
  `Collapse All`, and `Clear`.
- Use compact panel footers for short summaries, such as active scenario state,
  Inspector target, and Log event count.

Expected structure:

```text
Top app bar
  Atom Playground
  Forms
    Field
    Checkbox
    RadioGroup
  Overlays
    Dialog
    Popover
    Select
  Navigation
    Tabs
    Accordion
  Data
    Table
    Tree
  Utilities
    Portal
    VisuallyHidden
  @flowstack-ui/atom 0.1.0

Main area
  Scenario title
  Anatomy
  Canvas
    Canvas toolbar menu
    Live component only
    Canvas footer
  Inspector
    Selected
    Focused
    Logs
    Inspector footer
```

The visual order and DOM order should match:

```text
Menubar -> Anatomy -> Canvas toolbar -> Canvas component -> Inspector
```

## Scenario Rules

Prefer one useful interactive scenario over many small examples.

Good:

- one Dialog scenario that can test open state, Escape, focus restore, labels,
  disabled trigger, and `data-state`
- one Select scenario that can test value, disabled items, keyboard navigation,
  portal, and form output
- one Menu scenario that can test item navigation, checkbox/radio items,
  submenus, placement, and close behavior

Avoid:

- one example for Escape and another nearly identical example for focus
- long prose explaining basic component purpose
- examples that exist only to show every prop

Each scenario should include:

- a short human title
- an Anatomy panel for the component parts and live state
- an Anatomy header action when the panel has many collapsible groups
- a Canvas panel containing only the component being tested
- a Canvas toolbar menu for important state or props
- a Canvas footer for one-line scenario state
- an Inspector with `Selected`, `Focused`, and `Logs` tabs
- an Inspector footer that names the current target mode or event count

Do not put status text, duplicate state summaries, or helper explanations inside
the Canvas stage. If a value is state, put it in Anatomy. If it is an event, put
it in Inspector Logs. If it is a DOM attribute, make it visible through Inspector or
Anatomy.

Use short labels:

```text
Root
Trigger
Portal
Content
Focused
Selected
```

Avoid verbose labels. Say `Root`, `Trigger`, `Content`, or plain human words
when that is enough.

## Controls

Controls should test behavior, not decorate the page.

Use Atom primitives for playground controls:

- `Menubar.CheckboxItem` for boolean scenario options
- `Menubar.RadioGroup` and `Menubar.RadioItem` for small option sets
- `Button` for imperative actions
- `Field`, `Input`, and `Select` when the live component needs form controls

Examples:

```text
State
  Controlled
  Disabled
  Keep mounted

Composition
  Trigger
    default
    asChild
    render
```

Do not add controls for every prop unless that prop changes meaningful behavior.

For scenario props, prefer grouped menus in the Canvas toolbar. Keep the left
panel for Anatomy, not controls.

Menu rows should be easy to scan:

- labels start on the left
- selected marks sit on the right
- group related controls under short muted section labels
- use `Menubar.Separator` for real group breaks
- use subtle row dividers when a menu has many options
- keep common top-level menus consistent across scenarios when they apply:
  `State`, `Field`, `ARIA`, `Popup`, `Dismiss`, and `Composition`
- keep event blocking and debug logging controls in a clearly labeled section,
  not mixed with normal composition controls

## Anatomy

The Anatomy panel shows component parts using the same shape as the public
component anatomy.

For Dialog, that means:

```text
Root
Trigger
Portal
Overlay
Content
Title
Description
Close
```

For Select, that means:

```text
Root
Trigger
Value
Icon
Portal
Content
Scroll Up Button
Viewport
Group
Label
Item
Item Text
Item Indicator
Separator
Scroll Down Button
Arrow
```

Rules:

- Render Anatomy with the shared `AnatomyPanel` component, which uses Atom
  `Collapsible` internally. Do not add one-off collapsible anatomy code inside
  each scenario.
- Order top-level Anatomy groups to match the public component anatomy docs.
- Use collapsible groups when a component has many parts.
- Start groups collapsed unless a scenario has a strong reason to open one.
- Add a `Collapse All` header action when many groups can be expanded.
- Show a useful summary on collapsed groups.
- Do not repeat the summary value again inside the expanded group unless it is a
  real row.
- Put test variants under the real anatomy part instead of creating fake parts.
  For example, Dialog uses one `Close` group with `Cancel button` and
  `Save button` subsections. Select uses one `Item` group with
  `Selected item`, `Highlighted item`, `Raw item`, and `Disabled item`
  subsections.
- Keep generated DOM that users do not render manually under the owning public
  part. For example, Select's hidden form input lives under `Root` as
  `Generated hidden input`, not as a top-level anatomy group.
- Use human-readable top-level titles for camel-case parts, such as
  `Scroll Up Button`, `Item Text`, and `Item Indicator`.
- Rows should carry a category so the shared renderer orders them consistently:
  presence, identity, state, closing, blocking, composition, behavior,
  attributes, ARIA, then data. Rows within the same category are alphabetical.
- Use scenario rows for human-readable meaning: open state, controlled mode,
  close behavior, blocking behavior, focus behavior, relationships, and
  component-specific test results.
- Add a `selector` to every Anatomy section or subsection that represents a
  live DOM part. The shared Anatomy renderer uses that selector to read the
  current element and append raw DOM evidence.
- Raw DOM groups must be live, not hand-maintained. `Attributes`, `ARIA`, and
  `Data` should be derived from the current element in the Canvas or portal so
  they stay complete as the tester changes props and interactions.
- `Attributes` shows the tag name on the group title's right side. It includes
  native attributes such as `role`, `type`, `title`, `tabindex`, `name`, and
  `value`.
- `ARIA` shows live `aria-*` attributes exactly like the DOM, such as
  `aria-modal="true"`.
- `Data` shows live `data-*` attributes. Empty data flags render as flags, such
  as `data-disabled`, while valued attributes stay explicit, such as
  `data-state="open"`.
- Filter playground plumbing from raw groups. Do not show `class`, `style`,
  duplicated `id` inside `Attributes`, or `data-playground-inspect`.
- Use `data-prop-check="<part>"` as the standard playground marker for native
  prop pass-through tests. Keep it visible in raw `Data` so testers can verify
  the real DOM received the prop. Do not add separate curated rows like
  `Native props: passed`; the raw `data-prop-check` evidence is the test.
- Use lowercase generated values in curated rows: `true`, `false`, `none`,
  `open`, `closed`, `body`.
- Keep group headers visually stable between collapsed and expanded states.
- Make the whole group focus ring feel like one focused control.
- Prefer rows that answer direct testing questions, such as `controls match`,
  `inside canvas`, `hidden`, or `aria-modal`.
- Do not duplicate raw DOM evidence as curated rows unless it answers a
  separate behavior question. For example, `role="dialog"` belongs in
  `Attributes`; `Content role` belongs only if we are testing the configured
  prop while the DOM part is not mounted.

## Canvas

The Canvas is for the live component, not for documentation.

Rules:

- The stage should contain only the component parts needed for the scenario.
- Controls live in the Canvas toolbar menu, above the stage.
- Status summaries live in Anatomy or Inspector Logs, not inside the stage.
- A scenario can include imperative test buttons when they are part of the
  behavior being tested, such as a controlled open button.
- Keep portal behavior real. If a component portals to `document.body`, do not
  fake it into the Canvas just to keep it visually contained.
- When a primitive has no public trigger part, do not invent one in Anatomy.
  Use controlled state or the primitive's real positioning API in Canvas, and
  document any missing public API coverage in the coverage tracker.
- Include a `Focus Canvas` button in the Canvas title bar when tabbing through
  the full workbench would slow manual testing.
- Include a Canvas `Source` view for the clean Atom JSX that produces the live
  component. The source should update from scenario state and omit playground
  plumbing such as refs, log markers, layout wrappers, and CSS classes.
- Use the Canvas footer for short state summaries that should not be inside the
  live component area.

## Inspector

The Inspector should make live DOM state and interaction logs easy to check
without reading a huge HTML dump.

Use three tabs:

- `Selected` for the element the tester clicked
- `Focused` for the current active element
- `Logs` for interaction events and close/open reasons

Useful fields:

- `ID`
- `Text` when the selected/focused element has direct text
- `Value` when the selected/focused element has a value
- native `Attributes`, with tag name on the title row
- `ARIA`
- `Data`
- footer flags for computed `disabled` and `hidden`

Keep focused and selected targets separate. Use tabs or another clear switch so
it is obvious whether the rows describe the currently focused element or the
element the tester clicked.

Raw groups follow the same filtering and formatting rules as Anatomy:

- do not show `class`, `style`, duplicated `id`, or `data-playground-inspect`
- keep `aria-*` values explicit, such as `aria-disabled="true"`
- render empty data flags as flags, such as `data-checked`
- keep valued data attributes explicit, such as `data-value="starter"`

Prefer flat panels with dividers inside the Inspector card. Avoid nested boxes
that make the panel feel heavier than the data.

The inspector can update from:

- current focus
- clicking an element inside the live canvas
- clicking a portalled element marked for playground inspection
- `MutationObserver` watching attribute changes

## Live Canvas Inspection

Anatomy, Inspector, and Canvas Source should eventually share one live canvas
inspection layer.

Target direction:

- The live inspector owns Canvas root lookup, portal lookup, selected/focused
  elements, DOM attribute formatting, filtered playground plumbing, and mutation
  updates.
- Anatomy uses the same live inspector for each part selector, then adds
  curated behavior rows that explain what the part is doing.
- Inspector uses the same live inspector for selected/focused elements.
- Source uses the same scenario state as Canvas, but not DOM extraction, because
  DOM cannot reconstruct React source.
- Scenario files should not manually copy every `aria-*` and `data-*`
  attribute. They should provide selectors and curated behavior rows.

This keeps live DOM evidence complete while preserving readable behavior
summaries for each component part.

## Logs

The Logs tab records behavior events that should remain visible after the
component closes.

Rules:

- Use short timestamps, such as `14:05`.
- Use plain rows with dividers, matching Inspector density.
- When there are no events, leave the row area empty and let the footer show
  `0 Events`.
- Do not add fake startup events like `ready`.
- Do not log `log cleared`; clearing the log should simply return to the empty
  state.
- Keep event text direct, such as `opened by trigger`, `opened by external
  control`, `closed by escapeKeyDown`, or `closed by backdropClick`.
- Put `Clear` in the Inspector header area when Logs is active, not inside the
  log rows.
- Use the Inspector footer for event count when Logs is active.

## Coverage Tracker

Track playground coverage in `component-coverage.xlsx`.

Rules:

- Use one sheet per component. The Dialog sheet is named `Dialog`.
  The Select sheet is named `Select`. The Menu sheet is named `Menu`.
- Keep the rows broad enough to cover the full component surface: public API,
  interaction, accessibility, composition, refs, native props, styling hooks,
  portal behavior, and mobile behavior when relevant.
- Native prop coverage should point testers to the relevant part's raw `Data`
  group and its `data-prop-check="<part>"` marker. One non-Atom-owned marker is
  enough to prove rest props pass through for that part.
- Use `covered`, `partial`, or `missing`.
- Treat `partial` as half covered in the percentage.
- Update the tracker when a scenario gains or loses coverage.
- The tracker is repo documentation for playground work. It is not part of the
  npm package.

## Styling

Use plain CSS. Do not use Tailwind, design tokens, styled packages, icons, or a
theme runtime.

The playground can look polished, but it is only a neutral testing skin. Keep
styles shared and boring so scenarios stay consistent.

Use the same UI model across scenarios:

- desktop-style `AppBar` and `Menubar` at the top
- no persistent sidebar
- compact cards for Anatomy, Canvas, and Inspector
- Canvas toolbar menus for prop controls
- header actions for panel commands
- footers for short panel summaries
- readable row tables for live state
- no long instructional prose in the UI

## Scenario Order

Dialog established the initial playground pattern. Select added form, listbox,
typeahead, scroll, nested overlay, and generated hidden input coverage. Menu,
Dropdown Menu, and Context Menu proved shared command-menu behavior, checkbox
and radio items, submenus, placement, and close behavior. Popover, HoverCard,
Tooltip, and Alert Dialog extend the overlay set with anchored popup behavior,
hover/focus timing, tooltip relationships, and destructive confirmation behavior.

Dialog is a good first scenario because it exercises:

- trigger behavior
- portal rendering
- overlay/content state
- Escape close
- focus restore
- labels and descriptions
- controlled and uncontrolled open state
- `aria-*` and `data-state`

Use these first scenarios to prove shared playground patterns before adding the
rest of the primitives. Avoid extracting more shared UI until a repeated pattern
has appeared in at least two scenarios and is likely to remain stable. The next
shared extraction candidates are the Canvas toolbar builders, scenario log
rendering, source rendering helpers, and live DOM evidence used by Anatomy and
Inspector.
