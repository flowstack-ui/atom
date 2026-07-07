# Current Playground Direction

This file reflects the current state of the playground. Completed work should
not stay here as history, and permanent decisions belong in `docs/`.

The playground is a desktop-style manual testing workbench for Atom UI. It
tests real browser behavior that package tests cannot fully show: focus,
keyboard flow, pointer interaction, portals, form participation, controlled and
uncontrolled state, and live DOM attributes.

Detailed documentation starts at `docs/README.md`.

## Current Structure

Every component page should follow the same main layout:

```text
Top app bar
Scenario title
Anatomy
Canvas
  Canvas toolbar
  Live component stage
  Canvas footer
Inspector
  Selected
  Focused
  Logs
```

The visual and DOM order should stay:

```text
Top menu -> Anatomy -> Canvas toolbar -> Canvas component -> Inspector
```

## Current Conventions

- The top app bar and Canvas toolbar use Atom `Menubar`.
- Panel actions use Atom `Button`.
- Anatomy uses Atom `Collapsible`.
- Inspector and Source panels use Atom `Tabs` and `ScrollArea`.
- Form-like scenario controls should use Atom form primitives when practical.
- Scenario pages should reuse `src/WorkbenchPrimitives.tsx` before adding
  local toolbar, log, or prop-check helpers.

## Anatomy Direction

Anatomy should show real public component parts in public anatomy order. If a
scenario renders multiple instances of the same part, name them clearly, such
as `Item: Alpha`, `Item: Bravo`, `Action: Start`, and `Action: End`.

Raw DOM evidence is part of the Anatomy contract. Sections with a selector
should show live `Attributes`, `ARIA`, and `Data` using the same formatting as
Inspector.

## Props And Slots

`data-prop-check` and custom `data-slot` checks are real Atom prop tests. They
stay behind `Props` toolbar controls and are verified through raw `Data`, not
curated status rows. See `docs/component-testing.md`.

## Source View

Source should show the Atom JSX that creates the live Canvas scenario. It must
update when state, composition, props, slot overrides, and rendered Atom
components change. It should omit playground-only layout, classes, logs, refs,
and inspection plumbing.
