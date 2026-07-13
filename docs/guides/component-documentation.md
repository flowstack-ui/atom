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

- A short description of what the primitive owns.
- Features that describe behavior, state, focus, keyboard, geometry, portal,
  form, or direction support when relevant.
- Import example using the main package namespace import.
- Anatomy showing every public part owned by the component.
- API Reference with one section per public part.
- Examples that show practical composition.
- Accessibility notes, including roles, labels, relationships, and keyboard
  behavior when the component owns them.
- Changelog link.

Do not document visual styling, colors, icons, layout presets, or design system
variants unless the Atom package itself owns that behavior.

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

Omit a table only when the part does not emit that category.

## Props

List Atom-owned public props for the part:

- state props such as `value`, `open`, `checked`, and defaults
- event props such as `onValueChange` and `onOpenChange`
- behavior props such as `loop`, `orientation`, `dir`, `modal`, and
  `closeOnSelect`
- composition props such as `asChild` and `render`
- Atom naming props such as `ariaLabel` when the component defines them

Do not exhaustively list native HTML props that pass through by type extension.
Mention native prop pass-through in prose only when it matters.

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

## Source Audit Checklist

Before finishing a component doc update:

1. Inspect the component source under `src/primitives/<component>/`.
2. Identify every exported public part and hook.
3. Check default rendered tags, roles, ARIA attributes, data attributes, and
   no-DOM behavior.
4. Check controlled and uncontrolled props, disabled behavior, direction
   support, keyboard behavior, and composition paths.
5. Check `asChild` and `render` support for every part that exposes them.
6. Compare docs against tests and update tests if source behavior changed.
7. Update the component `CHANGELOG.md` for user-visible behavior, API, or docs
   corrections.
8. Run the relevant docs, test, or build checks for the change scope.

Docs-only corrections usually do not require a package changelog entry unless
they change published release notes or package-level guidance.
