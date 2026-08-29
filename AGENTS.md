# AGENTS.md - Atom Package

This folder owns the actual npm package for `@flowstack-ui/atom`.

## Read First

1. Read `../AGENTS.md` for root AI routing and the package boundary.
2. Read `../docs/README.md` for maintainer practices, decisions, workflows,
   and research.
3. Read `README.md` for package overview and usage.
4. Read `docs/README.md` for the public package documentation index.
5. For component docs, read `docs/guides/component-documentation.md`.
6. Then follow the relevant root practices, workflows, and decisions for the
   task.

## FLOWSTACK Agent Workflows

Choose the primary workflow before doing task work. Review-only or diagnostic
requests use `$flowstack-ui-review`. Package source, primitive API, Agent
Knowledge, dependency, qualification, or release work uses
`$flowstack-ui-maintainer`. A supplied application-plan composition in a
playground or example uses `$flowstack-ui-compose` only when it does not change
package-owned behavior. Other consumer-style example implementation uses
`$flowstack-ui-builder` under the same boundary. The more specific route wins;
all public primitive changes use Maintainer.

If the matching skill is not discoverable, read its canonical `SKILL.md` from
an installed or checked-out `flowstack-ui/agent-tools` repository and follow
that workflow manually. If neither is available, preserve the mapping, resolve
exact-version package Agent Knowledge directly, and report the missing skill
instead of substituting remembered guidance.

## Scope

- Package source, tests, public docs, changelogs, package metadata, and package
  scripts live here.
- Playground work lives under `playground/`; read `playground/AGENTS.md` only
  for playground-related tasks.
- Do not edit generated folders such as `dist/` or `node_modules/`.
- Before changing primitives, follow the root practices and workflows in
  `../docs/`, especially primitive review, accessibility, React API, testing,
  and package export guidance.
