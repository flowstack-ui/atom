# Component Documentation

Use this guide when adding, auditing, or updating docs under
`docs/components/`.

Component docs are public API documentation. They should describe the behavior
Atom owns, the DOM and accessibility contract it emits, and the public
composition surface available to consumers.

## Start From The Template

Use `docs/components/_template/README.md` and
`docs/components/_template/CHANGELOG.md` when creating a new component doc.

The template is the skeleton. This guide is the review standard.

## Required Sections

Each component `README.md` should include:

- A short description of what the primitive is and what behavior Atom owns.
- A `When to Use` section that explains the problem the component solves and
  distinguishes it from similar primitives.
- Features that describe behavior, state, focus, keyboard, geometry, portal,
  form, or direction support when relevant.
- Import example using the main package namespace import.
- Anatomy showing every public part owned by the component, without unrelated
  example code.
- API Reference with one section per public part.
- Copy-paste-ready examples that show practical, unstyled composition.
- Accessibility notes, including roles, labels, relationships, and keyboard
  behavior when the component owns them.
- Changelog link.

Do not document visual styling, colors, icons, layout presets, or design system
variants unless the Atom package itself owns that behavior.

Use this section order consistently:

1. Component name and short description
2. When to Use
3. Features
4. Import
5. Anatomy
6. API Reference
7. Examples
8. Accessibility
9. Changelog

## Description And When To Use

Start with a short technical description of the component and the behavior Atom
owns. Follow it with a `When to Use` section written in simple, direct language.
The guidance should be understandable without prior knowledge of accessibility
patterns while remaining accurate and professional.

The usage guidance should answer:

- What problem does this component solve?
- What kind of interface should use it?
- Which similar Atom primitive might a developer confuse it with?
- When should the developer choose that other primitive instead?

Only compare related primitives when the distinction is useful. Do not turn the
section into a complete component catalog or repeat the feature list.

## Anatomy

Anatomy is a visual map of the public compound API, not a runnable example.

- Show every namespaced public part, including optional parts and public aliases.
- Show how parts nest when nesting is part of the composition contract.
- Include a part more than once only when repetition helps explain composition.
- Do not include imports, exports, component functions, state, event handlers,
  application variables, or styling.
- For hook or utility documentation with no rendered anatomy, say so clearly and
  show the public hook or utility calls without inventing component parts.

The API Reference must follow the order in which parts first appear in Anatomy.
For hooks and utilities, use the order established in the Anatomy section.

## API Reference Format

Every public part should have its own API section, even when behavior is shared
with another primitive.

Use separate tables for props, ARIA attributes, and data attributes:

```md
### Root

Short description of the part.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"component"` |
```

Omit a table only when the part does not emit that category. Do not combine
multiple public parts into headings such as `Content and Items`, even when the
parts share an implementation or have identical tables.

The description beneath each part heading should explain something useful about
the part. State its responsibility, its relationship to surrounding parts, its
default rendered element when important, or the behavior it owns. Avoid
descriptions that only restate the heading, such as "Contains the treegrid" or
"Renders the item."

## Props

List Atom-owned public props for the part:

- state props such as `value`, `open`, `checked`, and defaults
- event props such as `onValueChange` and `onOpenChange`
- behavior props such as `loop`, `orientation`, `dir`, `modal`, and
  `closeOnSelect`
- composition props such as `asChild` and `render`
- Atom naming props such as `ariaLabel` when the component defines them

Do not exhaustively list native HTML props that pass through by type extension.
Document every Atom-owned public prop, including props inherited from a shared
implementation. Mention the default rendered element and native prop
pass-through in prose when it helps readers understand which native attributes
they may provide. Do not make readers open another component README to discover
shared props.

Do not list `data-slot` in the Prop table unless the component intentionally
defines a public prop with that name. The rendered attribute belongs in the Data
attribute table.

## ARIA Attributes

Document rendered roles and ARIA attributes that Atom owns or defaults.

Use rendered attribute names in this table, such as `aria-label`,
`aria-expanded`, `aria-selected`, `aria-current`, and `aria-orientation`.

If the public prop is camel-cased, document both sides in the correct places:
`ariaLabel` belongs in the Prop table, while rendered `aria-label` belongs in
the ARIA table.

Document default labels, generated relationships, hidden semantics, and no-DOM
cases when relevant.

## Data Attributes

Document stable styling and state attributes emitted by Atom:

- `[data-slot]`
- `[data-state]`
- `[data-disabled]`
- `[data-orientation]`
- `[data-selected]`
- `[data-current]`
- other component-owned state markers

Use bracketed selector format for attributes, for example `[data-slot]`, not
`data-slot`.

## Shared Behavior

If a component shares implementation or behavior with another primitive, the
docs can say so in prose, but the component still needs complete part-level API
coverage.

For example, a menubar may share menu item behavior, but a developer reading
only the menubar docs should still see the props, ARIA attributes, and data
attributes for menubar parts.

## Examples

Examples should be ready to copy into a React project and should work without
missing definitions.

- Include all required `@flowstack-ui/atom` imports in each example.
- Include the component function or other surrounding code needed to make the
  snippet valid TSX.
- Define state, values, handlers, and sample data used by the example.
- Use public package imports only.
- Do not include CSS, Tailwind classes, visual tokens, icons, or decorative
  styling.
- Keep examples focused on practical behavior or composition rather than visual
  presentation.
- Use multiple examples when one snippet cannot clearly demonstrate the
  component's important modes.

Some headless utilities, such as virtualizers, require consumer-owned layout
geometry to function. In those exceptional cases, include only the minimum
inline layout values required to demonstrate the public behavior and explain
why they are necessary. Do not present them as Atom styles.

## Accessibility

Accessibility documentation should explain the contract a developer needs in
order to use the component correctly.

- Identify the native HTML semantic or WAI-ARIA pattern the component follows.
- Link to the authoritative WAI-ARIA specification or Authoring Practices Guide
  pattern when one applies.
- Describe owned roles, accessible names, descriptions, relationships, live
  announcements, focus behavior, and hidden semantics when relevant.
- State what the consumer must provide, such as a label or visible title.
- Include a keyboard table whenever Atom owns keyboard interaction for the
  component.
- Document direction-dependent keys when left-to-right and right-to-left
  behavior differs.

Describe the behavior demonstrated by source and tests. Prefer precise wording
such as "follows the WAI-ARIA tree pattern" over unsupported blanket claims of
complete compatibility.

Use this keyboard table format:

```md
| Key | Description |
| --- | --- |
| `ArrowDown` | Moves focus to the next enabled item. |
```

Components without component-owned keyboard behavior do not need an empty
keyboard table.

## Changelogs

Every component documentation folder must contain a `CHANGELOG.md`, and every
README must end with a link to it.

- Record user-visible component behavior, accessibility, public API, and
  meaningful published documentation corrections under `Unreleased`.
- A documentation correction belongs in the affected component changelog when
  it changes what consumers are told about that component's API or behavior.
- Changes only to this authoring guide or the reusable templates do not require
  entries in every component changelog.
- Docs-only corrections do not require a package-level changelog entry unless
  they change package-wide published guidance or release notes.
- Use `- No unreleased changes.` when a component has no unreleased entries.
  Remove that line as soon as a real entry is added.
- Do not leave placeholders such as `Initial notes` or an empty `Unreleased`
  section.

## Source Audit Checklist

Before finishing a component doc update:

1. Inspect the component source under `src/primitives/<component>/`.
2. Identify every exported public part and hook.
3. Check default rendered tags, roles, ARIA attributes, data attributes, and
   no-DOM behavior.
4. Check controlled and uncontrolled props, disabled behavior, direction
   support, keyboard behavior, and composition paths.
5. Check `asChild` and `render` support for every part that exposes them.
6. Verify Anatomy contains every public namespace part or documented public
   hook and utility.
7. Verify API sections are separate and follow Anatomy order.
8. Compare docs against tests and update tests if source behavior changed.
9. Verify every example is self-contained and uses public imports.
10. Verify the accessibility section cites the applicable native or WAI-ARIA
    contract and documents every component-owned key.
11. Update the component `CHANGELOG.md` for user-visible behavior, API, or
    meaningful docs corrections.
12. Run the relevant docs, test, or build checks for the change scope.

Docs-only corrections usually do not require a package changelog entry unless
they change published release notes or package-level guidance.
