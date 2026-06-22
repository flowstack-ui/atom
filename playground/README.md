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

## App Shape

Build the playground like a small desktop-style tool.

- Use a top toolbar/menu bar.
- Use dropdown menus for component categories directly in the top bar.
- Use nested submenus only when a category needs them.
- Do not add a persistent sidebar.
- Keep the main area focused on the selected scenario.
- Put scenario prop controls in the Canvas toolbar when they affect the live
  component.
- Show the current package name and version on the right side of the top bar.

Expected structure:

```text
Top toolbar
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
    Canvas toolbar
    Live component only
  Inspector
  Log
```

The visual order and DOM order should match:

```text
Menubar -> Anatomy -> Canvas toolbar -> Canvas component -> Inspector -> Log
```

## Scenario Rules

Prefer one useful interactive scenario over many small examples.

Good:

- one Dialog scenario that can test open state, Escape, focus restore, labels,
  disabled trigger, and `data-state`
- one Select scenario that can test value, disabled items, keyboard navigation,
  portal, and form output

Avoid:

- one example for Escape and another nearly identical example for focus
- long prose explaining basic component purpose
- examples that exist only to show every prop

Each scenario should include:

- a short human title
- an Anatomy panel for the component parts and live state
- a Canvas panel containing only the component being tested
- a Canvas toolbar for important state or props
- an Inspector for focused or selected DOM details
- a Log for interaction events and close/open reasons

Do not put status text, duplicate state summaries, or helper explanations inside
the Canvas stage. If a value is state, put it in Anatomy. If it is an event, put
it in Log. If it is a DOM attribute, make it visible through Inspector or
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

Use simple controls:

- checkbox/toggle for booleans
- select for small option sets
- text input for controlled values
- buttons for imperative actions

Examples:

```text
[Controlled] [Disabled] [Keep mounted] [RTL]
Placement: [top | right | bottom | left]
Value: [____________]
```

Do not add controls for every prop unless that prop changes meaningful behavior.

For boolean scenario props, prefer compact toggle buttons in the Canvas toolbar.
Keep the left panel for Anatomy, not controls.

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
```

Rules:

- Use collapsible groups when a component has many parts.
- Show a useful summary on collapsed groups.
- Do not repeat the summary value again inside the expanded group unless it is a
  real row.
- Use lowercase generated values: `yes`, `no`, `none`, `open`, `closed`,
  `body`.
- Keep group headers visually stable between collapsed and expanded states.
- Make the whole group focus ring feel like one focused control.
- Prefer rows that answer direct testing questions, such as `controls match`,
  `inside canvas`, `hidden`, or `aria-modal`.

## Canvas

The Canvas is for the live component, not for documentation.

Rules:

- The stage should contain only the component parts needed for the scenario.
- Controls live in the Canvas toolbar, above the stage.
- Status summaries live in Anatomy or Log, not inside the stage.
- A scenario can include imperative test buttons when they are part of the
  behavior being tested, such as a controlled open button.
- Keep portal behavior real. If a component portals to `document.body`, do not
  fake it into the Canvas just to keep it visually contained.
- Include a `Focus Canvas` button in the Canvas title bar when tabbing through
  the full workbench would slow manual testing.

## Inspector

The inspector should make live DOM state easy to check without reading a huge
HTML dump.

Useful fields:

- tag name
- role
- `aria-*`
- `data-*`
- `disabled`
- `hidden`
- focusable
- `tabindex` attribute

Keep focused and selected targets separate. Use tabs or another clear switch so
it is obvious whether the rows describe the currently focused element or the
element the tester clicked.

Prefer flat rows with dividers inside the Inspector card. Avoid nested boxes
that make the panel feel heavier than the data.

The inspector can update from:

- current focus
- clicking an element inside the live canvas
- clicking a portalled element marked for playground inspection
- `MutationObserver` watching attribute changes

## Log

The Log records behavior events that should remain visible after the component
closes.

Rules:

- Use short timestamps, such as `14:05`.
- Use plain rows with dividers, matching Inspector density.
- Start with an empty state like `no events`.
- Do not add fake startup events like `ready`.
- Do not log `log cleared`; clearing the log should simply return to the empty
  state.
- Keep event text direct, such as `opened by trigger`, `opened by external
  control`, `closed by escapeKeyDown`, or `closed by backdropClick`.

## Coverage Tracker

Track playground coverage in `component-coverage.xlsx`.

Rules:

- Use one sheet per component. The Dialog sheet is named `Dialog`.
- Keep the rows broad enough to cover the full component surface: public API,
  interaction, accessibility, composition, refs, native props, styling hooks,
  portal behavior, and mobile behavior when relevant.
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

- desktop-style menu bar at the top
- no persistent sidebar
- compact cards for Anatomy, Canvas, Inspector, and Log
- Canvas toolbar for prop toggles
- readable row tables for live state
- no long instructional prose in the UI

## First Scenario

Start with `Dialog`.

Dialog is a good first scenario because it exercises:

- trigger behavior
- portal rendering
- overlay/content state
- Escape close
- focus restore
- labels and descriptions
- controlled and uncontrolled open state
- `aria-*` and `data-state`

Use that first scenario to prove the playground pattern before adding the rest
of the primitives.
