# Playground Todo

Active playground work only. Conventions and rules live in `CURRENT.md` and
`docs/`. Component rules are in `docs/component-testing.md`; workbook rules are
in `docs/coverage.md`; update workflow is in `docs/workflow.md`.

## Coverage Completion

- Continue implementing and testing component pages until every workbook row
  that belongs to playground coverage is complete.
- Remove workbook rows that are package export, docs-only, or release checks
  rather than playground-verifiable behavior.
- Keep the index formulas and conditional formatting accurate after each
  workbook update.

## Scenario Consistency

- Finish migrating remaining scenarios to the shared `PropsToolbarGroup` and
  `partProps` pattern where the component renders Atom DOM parts.
- Confirm every scenario Source view updates for state, composition, props, and
  the Atom components rendered in Canvas.
- Review completed scenarios for old always-on `data-prop-check` markers that
  should now live behind `Props > Prop Check`.

## Shared Workbench Primitives

- Extract more repeated toolbar builders only after patterns repeat across
  several completed components.
- Review `src/WorkbenchPrimitives.tsx` after each component group and move
  repeated toolbar, log, and panel chrome patterns there when stable.

## Live Inspection

- Continue consolidating raw DOM evidence so Anatomy and Inspector use the same
  formatting rules for `Attributes`, `ARIA`, and `Data`.
- Improve portal inspection when a scenario owns portalled DOM outside the
  Canvas card.

## Future Automation

- Add browser smoke tests for the highest-risk manual flows after the main
  component pages stabilize.
- Start with Dialog, Select, Menu, Combobox, File Upload, Slider, Rating, and
  Swipeable Item.
