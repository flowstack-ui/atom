# Playground Todo

This file tracks planned playground improvements that are not ready to build
yet. Keep it practical and update it when the playground conventions change.

## Toolbar Standardization

We want a reusable toolbar system so Dialog, Select, Menu, and future scenarios
do not hand-roll different menu structures for the same ideas.

The goal is two layers:

1. Shared toolbar renderer
   - Owns the Atom `Menubar` layout.
   - Owns section labels, separators, check/radio placement, row height, and
     hover/highlight styling.
   - Keeps the Canvas toolbar visually and behaviorally consistent.

2. Shared control builders
   - Own standard names, order, and repeated option sets.
   - Avoid repeated labels like `default`, `asChild`, and `render` in every
     scenario file.
   - Make future wording changes possible in one place.

Example target shape:

```ts
toolbarControls.compositionMode({
  label: "Trigger",
  value: state.triggerMode,
  onChange: actions.setTriggerMode,
});
```

That builder should always render the same labels and order:

```text
Trigger
  Default
  As Child
  Render
```

## Standard Top-Level Groups

Use these groups when they apply. Do not invent new group names unless a
component genuinely needs a new category.

### State

Core state owned by the root/component.

- Controlled
- Open
- Default open
- Value
- Checked
- Selected
- Disabled
- Required
- Read only
- Invalid
- Modal
- Loop

### Dismiss

Ways an overlay or item interaction closes, or intentionally does not close.

- Escape closes
- Outside closes
- Backdrop closes
- Close on select
- Checkbox closes
- Radio closes
- Prevent close

### Field

Field integration only. These controls prove inheritance through `Field.Root`,
not direct component props.

- Use Field
- Field disabled
- Field required
- Field invalid
- Label wiring
- Description wiring
- Error wiring

Direct `Disabled` and `Field disabled` should stay separate because they test
different code paths even when the final visual behavior is similar.

### Popup

Layer and positioning behavior.

- Portal
- Side
- Align
- Offset
- Anchor point
- Keep mounted when it controls popup mounting

### Content

Content-level behavior inside the component or popup.

- Role
- ariaLabel
- Title/description edge cases
- Content loop
- Long content
- Scroll buttons
- Focus behavior

Scroll buttons belong here more than `Popup` because they test content
scrolling, not layer positioning.

### Items

Collection item variants.

- Disabled item
- Selected item
- Highlighted item
- Checkbox item
- Radio item
- Submenu item
- Group
- Label
- Separator

Use consistent rules for whether an item is always rendered or toggled by a
toolbar option. If the item name says `Disabled item`, it must actually be
disabled whenever it is visible.

### Composition

Element override and event merging.

- Default
- As Child
- Render
- Block trigger event
- Block item event
- Block close event
- Prevent default

### Accessibility

ARIA and accessible-name edge cases that are not better owned by Field or
Content.

- ariaLabel
- aria-labelledby
- aria-describedby
- Required ARIA
- Role variants

If an `ariaLabel` belongs to popup content, prefer putting it under `Content`.

### Nesting

Cross-component scenarios.

- Inside Dialog
- Menu in Dialog
- Select in Dialog
- Nested submenu
- Submenu in submenu
- Nested overlay focus behavior

## Current Inconsistencies To Resolve

- Dialog, Select, and Menu each define toolbar rows locally.
- Composition labels and order can drift between scenarios.
- Common controls such as Controlled, Disabled, Required, Side, Align, and
  ariaLabel are repeated manually.
- Select has direct `Disabled` and Field `Field disabled`; keep both, but label
  and group them so the difference is obvious.
- Select renders a disabled item by default, while Menu uses an option to show
  one. Decide a consistent rule per item type.
- Some controls are in questionable groups:
  - `Loop` may be root state for Menu, but content behavior for popup content.
  - `Required` is root state when direct, Field state when inherited.
  - Select scroll buttons should likely live under `Content`, not `Popup`.

## Live Canvas Inspection Standardization

The playground now needs one shared live inspection layer for the Canvas.
Anatomy, Inspector, and Source should not each invent their own way to know what
is live.

Target responsibilities:

1. Canvas DOM registry
   - Knows the Canvas root.
   - Can inspect portalled elements that belong to the active scenario.
   - Accepts part selectors from scenarios.
   - Filters playground-only plumbing such as `data-playground-inspect`.

2. DOM evidence formatter
   - Produces `ID`, tag, native attributes, `ARIA`, and `Data`.
   - Excludes `class`, `style`, and duplicate `id` in `Attributes`.
   - Shows empty `data-*` flags as flags.
   - Keeps `aria-*` values explicit.
   - Is shared by Anatomy and Inspector.

3. Mutation tracking
   - Watches the Canvas and known portals.
   - Refreshes on attribute changes and mounted/unmounted parts.
   - Covers state attributes such as `aria-checked`, `data-checked`,
     `data-highlighted`, `data-positioned`, `tabindex`, `role`, and `title`.

4. Scenario-owned meaning
   - Scenarios still own curated rows such as `Open`, `Disabled`, `Controls
     match`, `Inside canvas`, `Closing`, and `Blocking`.
   - Scenarios should stop manually duplicating raw `aria-*` and `data-*`
     attributes where the shared DOM formatter can read them.

5. Source view
   - Source remains generated from scenario state, not the DOM.
   - It should show clean Atom JSX only and omit playground refs, logs, layout,
     classes, and inspection markers.

Implementation should happen after the current Anatomy experiment is stable:

1. Extract shared DOM formatter from Inspector/Anatomy.
2. Add a part registry helper for scenario selectors.
3. Move MutationObserver logic into one canvas inspection hook.
4. Update Dialog, Select, and Menu to provide selectors plus curated rows only.
5. Keep the coverage tracker updated as scenarios change.

## Implementation Plan

1. Extract shared toolbar UI components.
   - `PlaygroundToolbar`
   - `PlaygroundToolbarGroup`
   - `PlaygroundToolbarSection`
   - `PlaygroundToolbarCheckbox`
   - `PlaygroundToolbarRadio`

2. Add shared control builders for repeated patterns.
   - `controlled`
   - `disabled`
   - `required`
   - `defaultOpen`
   - `escapeCloses`
   - `outsideCloses`
   - `side`
   - `align`
   - `sideOffset`
   - `ariaLabel`
   - `compositionMode`
   - `blockEvent`

3. Migrate existing scenarios one at a time.
   - Dialog
   - Select
   - Menu
   - Dropdown Menu
   - Context Menu
   - Popover
   - Alert Dialog

4. After two or three more components, review whether more builders are worth
   adding.

Do not build a giant global registry yet. The shared layer should reduce
repetition and enforce naming/order, while each scenario still owns its own
state and behavior meaning.
