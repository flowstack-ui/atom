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
- Add scenario controls in a compact toolbar when they help testing.
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
  Short checklist
  Live component canvas
  Scenario controls
  Inspector
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
- a live test area
- a compact checklist of what to try
- controls for important state or props
- an inspector target when useful

Use short checklist text:

```text
- Opens from trigger
- Escape closes
- Focus returns to trigger
- Disabled trigger does nothing
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

## Inspector

The inspector should make live DOM state easy to check without reading a huge
HTML dump.

Useful fields:

- focused element
- selected element
- tag name
- role
- `aria-*`
- `data-*`
- `disabled`
- `hidden`
- `tabindex`

Prefer a readable attribute table. A raw HTML snippet can be added later as a
collapsed detail if it proves useful.

The inspector can update from:

- current focus
- clicking an element inside the live canvas
- `MutationObserver` watching attribute changes

## Styling

Use plain CSS. Do not use Tailwind, design tokens, styled packages, icons, or a
theme runtime.

The playground can look polished, but it is only a neutral testing skin. Keep
styles shared and boring so scenarios stay consistent.

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
