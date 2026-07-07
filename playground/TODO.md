# Playground Todo

This file tracks planned playground improvements that are not ready to build
yet. Keep it practical and update it when the playground conventions change.

## Toolbar Standardization

We want a reusable toolbar system so Dialog, Select, Menu, and future scenarios
do not hand-roll different menu structures for the same ideas.

Shared module:

- `src/WorkbenchPrimitives.tsx`

Use this module for workbench chrome before adding new per-scenario helpers.
It currently owns:

- `ControlToolbar`
- `ToolbarGroup`
- `MenuSection`
- `MenuCheckboxControl`
- `MenuRadioControl`
- `PropsToolbarGroup`
- `ScenarioEventLog`

The shared module is for playground UI only. It must not own component-specific
scenario state, anatomy sections, or the live Atom component JSX.

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

- Scenario pages should not define private toolbar/log renderers. Add repeated
  workbench UI to `WorkbenchPrimitives` and keep scenario files focused on
  component state, anatomy data, source snippets, and canvas JSX.
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
   - Knows when a public API is a hook/utility with no Atom-rendered DOM, so
     Anatomy can show hook return values separately from consumer DOM evidence.

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

## Direction Coverage Audit

Direction-sensitive primitives need a shared rule before more pages are marked
complete.

Target responsibilities:

1. Source audit
   - Identify components where RTL changes behavior, not only visual styling.
   - Track components that already read `Direction.Provider`.
   - Track components that expose only a local `dir` prop.
   - Track components with left/right or start/end behavior that currently do
     not read direction.

2. Coverage tracker
   - Add rows only to direction-sensitive component tabs.
   - Rows should cover provider context, direct `dir` override when available,
     mirrored keyboard or pointer behavior, and playground controls.
   - Existing completed components should become incomplete again when a real
     direction gap is found.

3. Playground scenarios
   - Expose provider direction and direct override separately when the public API
     supports both.
   - Show active direction in Anatomy/Inspector/logs when it helps verify the
     behavior.

4. Source implementation, later
   - Standard component pattern should be direct `dir` prop first,
     `Direction.Provider` second, then component default.
   - Do not change source as part of the audit-only pass.

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

## Prop And Slot Coverage Migration

New rule: `data-prop-check` and custom `data-slot` checks are real Atom prop
tests, but they should not be always-on DOM noise.

Shared pieces now exist in `src/WorkbenchPrimitives.tsx`:

- `PropsToolbarGroup`
- `partProps`
- `propCheckAttr`
- `customSlotAttr`

Migration target for each component page:

1. Add a `Props` toolbar menu when the component renders Atom DOM parts.
2. Add `Prop Check`, off by default.
3. When enabled, pass `data-prop-check="<part>"` to every public part that
   should accept native/data props.
4. Add custom slot toggles for every slot-owning anatomy part that should allow
   `data-slot` override.
5. Keep custom slot toggles off by default.
6. Verify raw `Data` in Anatomy and Inspector shows the live DOM evidence.
7. Update `component-coverage.xlsx`.

Important migration note:

- Many older scenarios still use `data-prop-check` as an Anatomy selector. Do
  not simply make those markers optional. First move selectors to stable
  `data-slot`, real state attributes, or explicit scenario selectors. Then make
  the prop marker controlled by `Props > Prop Check`.

Current reference implementation:

- `Input` uses the shared `PropsToolbarGroup` and `partProps` helper for root
  and clear button coverage.
