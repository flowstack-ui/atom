# Component Testing Rules

Use this guide when adding or changing a component scenario.

## Scenario Shape

Prefer one useful interactive scenario over many tiny examples. A good scenario
tests multiple behaviors through controls and live interaction.

Each scenario should include:

- short human title
- Anatomy panel for component parts
- Canvas toolbar for state and props
- Canvas stage with the live component only
- Canvas footer with a short state summary
- Inspector with `Selected`, `Focused`, and `Logs`
- Source view with clean Atom JSX

Do not put helper explanations, duplicate state summaries, or unrelated status
text inside the Canvas stage.

## Terms

- **Atom DOM part**: a public Atom component part that renders a DOM element,
  such as `Dialog.Trigger`, `Select.Item`, or `Input.Clear`.
- **Slot-owning part**: an Atom DOM part that owns a default `data-slot` value
  and should accept a consumer override when the public API allows it.
- **Native prop passthrough**: normal DOM/data props supplied by the consumer
  reach the DOM element rendered by the Atom part.
- **Prop check**: the playground's optional `data-prop-check="<part>"` marker
  used to prove native prop passthrough in raw `Data`.

## Anatomy

Anatomy is for real component anatomy, not arbitrary example DOM.

Rules:

- Use public anatomy order from the component docs.
- Show only public component parts as top-level groups.
- If more than one instance of a part exists, name it clearly:
  `Item: Alpha`, `Item: Bravo`, `Action: Start`, `Action: End`.
- Do not add fake parts such as `Disabled item` unless that is the real part
  being inspected. Prefer `Item: Team` with a toolbar option named
  `Disable Item`.
- Keep generated DOM under the owning public part when it is not user-rendered.
- Use human labels for camel-case parts, such as `Scroll Up Button`,
  `Item Text`, and `Item Indicator`.
- Keep groups collapsed by default unless a scenario needs one open.
- Add `Collapse All` when many groups can expand.
- Do not duplicate collapsed summary values inside the expanded group unless
  they are real rows.

Rows should answer testing questions. Examples:

- `Open`
- `Mode`
- `Controls match`
- `Inside canvas`
- `Closing`
- `Blocking`
- `Ref`

Raw DOM evidence should come from the selected part selector and include:

- `Attributes` with the tag on the title row
- `ARIA`
- `Data`

Filter playground plumbing from raw evidence: `class`, `style`, duplicate `id`,
and `data-playground-inspect`.

## Inspector And Logs

Inspector is for live DOM evidence and interaction history. It should use three
tabs:

- `Selected` for the element clicked by the tester
- `Focused` for the current active element
- `Logs` for interaction events that should remain visible after a popup closes

Selected and Focused must stay separate so it is clear which element the rows
describe. Both views should show the same raw groups as Anatomy: `Attributes`,
`ARIA`, and `Data`, with the same filtering rules.

Inspector rows may also show useful computed fields:

- `ID`
- `Text` for direct text content
- `Value` for form values
- footer flags for computed `disabled` and `hidden`

Logs should stay compact:

- use short timestamps such as `14:05`
- use plain rows with dividers, matching Inspector density
- leave the row area empty when there are no events
- let the footer show the event count
- do not add fake events such as `ready` or `log cleared`
- keep event text direct, such as `opened by trigger`,
  `closed by escapeKeyDown`, or `item selected bravo`

Anatomy and Inspector should eventually share the same live DOM formatter and
mutation refresh path. Scenario files should provide selectors plus curated
behavior rows; they should not manually copy every live `aria-*` and `data-*`
attribute.

## Canvas Toolbar

Use Atom `Menubar` through shared workbench helpers. Keep toolbar groups
consistent across components.

Common top-level groups:

- `State`
- `Field`
- `Content`
- `Items`
- `Popup`
- `Dismiss`
- `ARIA`
- `Composition`
- `Props`

Use generic labels for repeated item controls:

- `Disable Item`
- `Disable Trigger`
- `Controlled`
- `Value`
- `Open`
- `Required`
- `Read Only`
- `Invalid`

Avoid component-specific names when a generic test meaning is clearer. For
example, prefer `Disable Item` over `Disable Team`.

## Toolbar Group Taxonomy

Use these top-level groups when they apply:

- `State`: root/component state such as `Controlled`, `Open`, `Value`,
  `Checked`, `Disabled`, `Required`, `Read Only`, `Invalid`, `Modal`, or
  `Loop`.
- `Field`: Field integration only, such as `Use Field`, inherited disabled,
  inherited required, label wiring, description wiring, and error wiring.
- `Content`: content-level behavior such as role, accessible label, long
  content, scroll buttons, title/description edges, and focus behavior.
- `Items`: collection item variants such as disabled item, selected item,
  highlighted item, checkbox item, radio item, group, label, and separator.
- `Popup`: layer and positioning behavior such as portal, side, align, offset,
  anchor point, and keep-mounted popup content.
- `Dismiss`: ways a popup or item closes, such as Escape, outside click,
  backdrop click, close on select, checkbox/radio close, and prevent close.
- `ARIA`: accessible-name and relationship edge cases that are not better owned
  by `Field` or `Content`.
- `Composition`: element override and event merging, including `Default`,
  `As Child`, `Render`, blocked events, and prevent-default behavior.
- `Props`: prop-check and slot-override controls for Atom DOM parts.
- `Nesting`: cross-component cases such as select/menu inside dialog or submenu
  inside submenu.

Keep direct component props and inherited Field state separate even when the
visual result is similar. For example, `Disabled` and `Field disabled` test
different paths.

## Controlled State

Controlled scenarios must prove both the controlled prop and the external
setter.

Rules:

- Put controlled value controls in the toolbar.
- Hide controlled value controls when `Controlled` is off.
- Do not let toolbar-controlled value state visually fight with uncontrolled
  component state.
- When turning controlled mode on or off, keep state transitions predictable and
  avoid stale footer/anatomy values.

## Props And Slot Overrides

Every rendered Atom DOM part that supports native/data props should have prop
pass-through coverage when practical.

Use the shared helpers:

- `PropsToolbarGroup`
- `partProps`
- `propCheckAttr`
- `customSlotAttr`

Rules:

- `Props > Prop Check` starts off.
- When enabled, pass `data-prop-check="<part>"` to each relevant Atom part.
- Custom slot toggles start off.
- When enabled, pass a real custom `data-slot` value to the Atom part.
- Verify through raw `Data` in Anatomy and Inspector.
- Do not add curated rows such as `Prop check true` or
  `Custom root slot false`.
- Do not add prop/slot rows for hooks or utilities that do not render Atom DOM.

Prop-check and custom-slot controls are test controls, not component state.
They should stay off by default so the normal DOM stays quiet. When enabled,
the raw `Data` group in Anatomy and Inspector is the evidence.

## Source

Source must show the Atom JSX that creates the live scenario.

Include:

- component state props such as `disabled`, `required`, `readOnly`, `invalid`
- controlled props and handlers when controlled mode is enabled
- composition props such as `asChild` and `render`
- `Direction.Provider` when the scenario renders one
- Field or native wrappers when they are part of the current scenario option
- prop-check and custom-slot props when enabled

Omit:

- CSS classes
- refs used only by playground inspection
- event-log plumbing
- layout-only wrappers
- `data-playground-inspect`

Use boolean shorthand in Source when that is how a consumer should write it:
`disabled`, not `disabled={true}`.

## Native And Atom Variants

Prefer Atom components in scenarios. Add a native HTML option only when it
tests a meaningful compatibility path, such as Field wiring with native inputs.

When both are available:

- keep visual styling consistent
- show the current option in Source
- make sure both options are manually testable

## Hooks And Utilities

Public hooks and utilities may have playground pages even when they do not
render Atom DOM by themselves.

Rules:

- show the hook or utility return values in Anatomy
- render the minimum consumer DOM needed to exercise the API
- show the actual hook or utility call in Source
- do not add prop-check or custom-slot rows when there is no Atom DOM part
- make the workbook explicit when a prop/slot test does not apply

## Direction

Add direction coverage only when direction changes component behavior, not just
consumer text layout.

Direction-sensitive behavior includes:

- left/right keyboard movement
- start/end placement
- submenu open/close direction
- swipe direction
- slider/rating math
- grid or tree horizontal navigation

The preferred Atom behavior is direct `dir` prop first, then
`Direction.Provider`, then default direction.
