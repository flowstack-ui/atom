# Playground Documentation

This folder holds the detailed documentation for the Atom playground. Router
files such as `../README.md` and `../AGENTS.md` should point here instead of
listing every document individually.

## Documents

- [overview.md](overview.md) - playground purpose, app shape, source rule, and
  shared styling direction.
- [setup.md](setup.md) - local install, dev server, build commands, and
  generated folders.
- [code-map.md](code-map.md) - key source files, scenario locations, shared
  workbench helpers, and workbook location.
- [component-testing.md](component-testing.md) - canonical scenario authoring
  rules for Anatomy, Canvas toolbar, Inspector, Logs, Source, props, slots,
  Manual Test Protocols, automation readiness, direction, hooks, and utilities.
- [coverage.md](coverage.md) - workbook purpose, row rules, statuses, formulas,
  contract-based coverage audits, prop checks, slot overrides, completion rules,
  and automation candidates.
- [decisions.md](decisions.md) - long-lived playground architecture decisions.
- [workflow.md](workflow.md) - standard component completion workflow and issue
  classification, including the Component Contract Audit and step-by-step Manual
  Test Protocol execution.

## Ownership

- Playground-specific implementation rules live in this documentation set.
- Shared developer tooling lives in
  [../../../docs/tooling.md](../../../docs/tooling.md).
- Manual Test Protocol authoring rules live in
  [component-testing.md](component-testing.md).
- The component completion workflow and Component Contract Audit live in
  [workflow.md](workflow.md).
- New shared tooling belongs in `../../../docs/tooling.md` when it is actually
  available to contributors.

## Manual Tests

- [../manual-tests/README.md](../manual-tests/README.md) - reviewed Manual Test
  Protocol location and lifecycle notes.
