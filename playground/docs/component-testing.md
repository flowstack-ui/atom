# Component Testing Rules

Use this guide when adding or changing a component scenario.

Before authoring or changing a scenario, complete the Component Contract Audit
in `workflow.md`. Scenarios and Manual Test Protocols should implement and
verify the established public contract; do not copy workbook rows or existing
playground behavior as the source of truth until they have been validated
against package source, package tests, and public package documentation.

## Scenario Shape

Prefer one useful interactive scenario over many tiny examples. A good scenario
tests multiple behaviors through controls and live interaction.

Scenario defaults should represent the simplest valid consumer usage. The
initial playground state should demonstrate the component's default API with
the fewest possible props while still rendering the public parts needed for
manual testing. Optional behavior belongs behind toolbar controls instead of
being enabled in the first-loaded Canvas.

For composite components that re-export or wrap another primitive's parts,
test the composite-owned behavior deeply and keep reused shared primitive
behavior to integration smoke coverage unless the composite changes that
behavior. Do not duplicate every prop, positioning, ref, and slot permutation
already owned by the shared primitive's own protocol.

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

When a component accepts local `dir` and also reuses child primitives that read
`Direction.Provider`, verify both local `dir` and provider direction modes. The
resolved direction should reach reused child behavior such as submenu placement,
keyboard open/close direction, and horizontal navigation.

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
- Only public anatomy parts become top-level Anatomy groups.
- If more than one instance of a part exists, name it clearly:
  `Item: Alpha`, `Item: Bravo`, `Action: Start`, `Action: End`.
- Do not add fake parts such as `Disabled item` unless that is the real part
  being inspected. Prefer `Item: Team` with a toolbar option named
  `Disable Item`.
- Keep generated DOM under the owning public part when it is not user-rendered.
- Do not invent fake anatomy parts to expose generated DOM. Generated DOM should
  be described inside the public part that owns it.
- Do not introduce fake evidence attributes simply to prove refs. Use real DOM
  evidence, focus behavior, or the existing ref row patterns instead.
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

## Manual Test Protocol Authoring

A Manual Test Protocol is a saved, step-by-step QA procedure for one component.
Use this term instead of `manual checklist`.

The goal is executable verification, not readability alone. A protocol should
guide a tester through checks in the browser; it should not explain how the
component is implemented or describe the component in prose.

A Manual Test Protocol is:

- a QA procedure
- not implementation documentation
- not a prose explanation
- not a copy of workbook rows

Use two protocol locations:

- `.manual-tests/` for draft protocols generated during active component work
- `manual-tests/` for reviewed, version-controlled regression protocols

Lifecycle:

1. Codex generates a draft protocol in `.manual-tests/`.
2. The tester and Codex execute the protocol during manual testing.
3. The protocol is improved based on real testing results.
4. Once reviewed and considered stable, promote it to
   `manual-tests/<component>.md`.

Reviewed protocol examples:

- `manual-tests/popover.md`
- `manual-tests/alert-dialog.md`

Keep only reviewed Manual Test Protocol files under `manual-tests/`. These
files are living regression documentation for retesting after package changes,
updating workbook coverage, generating automated Playwright tests, and
comparing old and new behavior.

### Protocol Structure

Every component protocol should use this order:

1. `Step 0: Playground Smoke Check`
2. `Step 1: Feature-Wide State`
3. `Step 2+: public anatomy parts in public order`
4. `Source`
5. `Inspector / Logs`
6. `Nested / Portal / Focus Behavior`, when applicable
7. `Workbook Cleanup / Rewrite Notes`

The exact public part steps depend on the component. Use public anatomy order
from the component docs. After feature-wide state, finish one public part
completely before moving to the next public part.

Each step should have exactly one testing target.

- `Playground Smoke Check` tests only that the page loads, the scenario renders,
  and core workbench panels respond.
- `Feature-Wide State` tests cross-part behavior such as controlled and
  uncontrolled state, `defaultOpen`, disabled, modal, outside close, trigger
  mode, and keep-mounted behavior. It should not repeat part-specific identity,
  default tag, slot, or ARIA checks that belong in public part steps.
- Public part steps test only that part.
- `Source` tests only generated Source output.
- `Inspector / Logs` tests only selected, focused, and event evidence.
- `Nested / Portal / Focus Behavior` tests only cross-layer browser behavior
  that does not belong to one public part.
- `Workbook Cleanup / Rewrite Notes` is not manual testing.

Do not put Trigger checks inside Root. Do not put Content checks inside Root.
Do not mix feature-wide behavior into part-specific steps. Do not repeat the
same check in multiple steps unless a later step verifies a different surface,
such as Source output instead of live DOM.

### Setup Discipline

Each step should begin from a clearly defined state. The tester should never
have to guess the starting state for a step.

Examples:

- Popover closed
- Controlled off
- Default composition
- Default props
- Default toolbar state

Avoid carrying hidden state between steps. If a previous step changes state,
either reset it or explicitly state that the next step continues from that
state.

### Step Format

Use this structure whenever applicable:

```text
Setup

Action

Verify

Reset
```

`Reset` is optional and should appear only when the step must return the
scenario to a known state.

`Setup` describes only the minimum state required. Prefer short, concrete
state statements over explanations.

`Action` describes exactly what the tester should do. Prefer one action at a
time.

`Verify` should use concise QA-style assertions. Prefer checkbox-style expected
results over narrative instructions.

Example:

```text
Setup

Popover closed

Action

Click Trigger

Verify

□ data-state="open"
□ aria-expanded="true"
□ aria-controls matches Content id
```

`Reset` returns to a known state only when necessary. Avoid unnecessary reset
steps.

### Public Part Verification

For each public anatomy part, include only sections that apply:

- `Identity`
- `ARIA`
- `Props / Slots`
- `Composition`
- `Interaction`

Do not generate empty sections. For example, omit `Composition` instead of
writing `Composition: none`.

Composition testing should include every supported public part. Do not cover
only the root/default path when other public parts support composition.

For each supported part, cover the applicable modes:

- `Default`
- `As Child`
- `Render`

### Expected Values

Stable values should always be explicit:

- default HTML tag
- `type`
- role
- `data-slot`
- `data-state`
- `data-side`
- `data-align`
- `data-positioned`
- `data-disabled`
- `data-prop-check`
- custom `data-slot`
- ARIA attributes with stable literal values

Dynamic values should never be invented. Describe relationships instead:

- `aria-controls` matches the Content id.
- `aria-labelledby` matches the Title id.
- `aria-describedby` matches the Description id.
- generated ids stay stable for the mounted instance and are used by the
  elements that reference them.

Distinguish native DOM and ARIA semantics from Atom component API behavior.
When a component prop maps to DOM output, name both surfaces clearly, such as
`ariaLabel` on the Atom component and rendered `aria-label` in live DOM. Native
HTML or ARIA attributes used as best-practice consumer markup, such as an
`aria-label` on an interactive child, should be verified as DOM/usage
expectations rather than described as Atom-specific component props.

### Tester Workflow

Optimize protocols for the tester's path through the UI. The tester should
finish one public part completely before moving to the next.

Prefer:

```text
Trigger -> complete Trigger -> Content -> complete Content -> Close
```

Avoid protocols that repeatedly jump between unrelated areas, such as Source,
Props, Composition, Trigger, and Source again. Source has its own step after
the public anatomy steps.

### Static And Behavioral Verification

Static verification covers deterministic DOM or workbench evidence:

- tag
- `data-slot`
- role
- `data-state`
- ARIA attributes and relationships
- prop pass-through
- slot overrides
- Source output

Behavior verification covers browser and user interaction:

- click
- keyboard
- focus
- pointer
- hover
- dismiss
- nested layers

Separate static verification from behavior verification when it makes the step
easier to execute. For example, verify `data-slot`, role, and ARIA before
keyboard or pointer behavior.

### Noise Reduction

The protocol should read like a QA test script.

- Avoid long numbered narratives.
- Avoid repeatedly writing `Expected values:`.
- Avoid explaining implementation details.
- Avoid repeating the same verification in multiple places.
- Use checkbox-style assertions for expected results.
- Keep each setup, action, and verification block short.

### Interactive Execution

Execute Manual Test Protocols one step at a time.

Agent behavior:

1. Create or update the draft component protocol in `.manual-tests/`.
2. Show only Step 0 first.
3. Wait for tester confirmation.
4. When the tester says `next`, show only the next step.
5. If the tester reports an issue, classify it as:
   - `Playground implementation gap`
   - `Package implementation bug`
   - `Package documentation gap`
   - `Workbook coverage gap`
   - `Documentation/process issue`
6. Do not continue until the current step passes or the issue is resolved or
   triaged.
7. Do not mark rows `Tested`, set final coverage to `covered`, or claim manual
   verification until every protocol step passes.
8. Promote the protocol to `manual-tests/<component>.md` only after it has been
   reviewed and considered stable.
9. After the component and promoted protocol commits are complete, perform the
   Reusable Lessons Review from `docs/workflow.md` before moving to the next
   component.

### Protocol Automation Readiness

Write static protocol checks so they can later become Playwright assertions.
Use exact values or explicit relationships that an automated test can assert.

Future automation should cover:

- default tags
- `data-slot`
- `data-state`
- ARIA attributes and relationships
- prop pass-through
- custom slot overrides
- Source output
- anatomy order
- provider and non-DOM rules

Manual testing should remain focused on:

- keyboard behavior
- focus management
- pointer behavior
- nested layer behavior
- browser behavior
- user experience

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

Authoring rules:

- Group controls by test meaning, not by whichever state object owns them.
- Group controls so the toolbar is readable without implying false
  relationships between unrelated behaviors.
- Keep radio selections separate from toggles.
- Keep toggles separate from actions.
- Avoid visually grouping controls that imply a relationship the component does
  not have.
- Use clear section titles inside larger menus.
- Keep ordering consistent across components when groups and controls repeat.
- Keep desktop menu structure and visual rhythm consistent across components.
- Use nested menus only when they make the choices clearer. Do not create
  unnecessary nesting only to reduce visible list length.
- Keep optional behavior off by default unless it is required for a valid
  default component example. Expose optional props, variants, edge cases, and
  accessibility-name overrides through toolbar controls so the default Canvas
  remains the canonical minimal implementation.

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

- default props
- default boolean `false` props
- CSS classes
- refs used only by playground inspection
- event-log plumbing
- layout-only wrappers
- playground-only state, handlers, and helper props
- `data-playground-inspect`

Use boolean shorthand in Source when that is how a consumer should write it:
`disabled`, not `disabled={true}`.

Generated Source should represent consumer code, not playground implementation.
Controlled props should appear only when controlled mode is active. Enabled
boolean props should use shorthand syntax, and disabled/default boolean props
should be omitted.

Playground plumbing must never appear in Source. This includes inspection refs,
event-log handlers that are not part of the consumer example, internal state
used only to drive toolbar controls, and layout wrappers that do not belong to
the rendered Atom example.

Format Source like code a maintainer would naturally write. Prefer readable
multiline JSX over mechanically generated long lines when nesting, composition,
or multiple props would make a tag hard to scan. Break multi-prop opening tags
onto separate lines and keep nested public parts visually nested like a normal
code editor would format them.

## Automation Readiness

Author new component scenarios so stable DOM and Source evidence can be
verified automatically later. Automation readiness is a design goal for every
scenario, not a backlog wish.

Expose deterministic evidence whenever possible for:

- default rendered tag
- `data-slot`
- `data-state`
- ARIA attributes
- ARIA relationships
- prop pass-through
- custom slot overrides
- Source output
- Anatomy order
- provider or non-DOM behavior without fake DOM identity

Use stable values when the component contract allows them. For generated ids or
browser-provided values, expose a deterministic relationship instead of a
literal value, such as one element's `aria-labelledby` referencing the current
title id.

Static verification should gradually move toward automated tests for stable
contracts. Future automated tests should verify default rendered tags,
`data-slot` values, `data-state` values, ARIA attributes and relationships,
prop pass-through, custom slot overrides, Source output, Anatomy order where
practical, and provider/non-DOM parts not receiving fake DOM identity.

Manual testing should primarily verify behavior automation cannot confidently
prove:

- keyboard flow
- pointer and touch behavior
- focus management
- nested layer behavior
- browser-specific behavior
- overall user experience

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
