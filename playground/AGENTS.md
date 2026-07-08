# Playground Agent Instructions

This folder is the repo-only browser playground for testing Atom UI primitives.

## Read First

- `README.md`
- `docs/README.md`
- `CURRENT.md`
- `TODO.md`

## Scope

- Work only inside `package/playground/` unless the user explicitly expands the
  scope.
- Do not edit Atom package source, package docs, configs, `dist/`, or
  `node_modules/` from a playground documentation task.
- Leave `component-coverage.xlsx.inspect.ndjson` untouched unless the user says
  otherwise.

## Rules

- Use public Atom imports in playground code.
- Dogfood Atom primitives for playground UI before writing custom behavior.
- Keep `README.md` and this file short. Put detailed rules in `docs/` and add
  them to `docs/README.md`.
- Keep `component-coverage.xlsx` updated when playground coverage changes.
- Before reading or writing `component-coverage.xlsx`, read
  `../../docs/tooling.md`, activate the shared developer tooling environment
  using the command documented there, verify `openpyxl` is available, and use
  `openpyxl` for workbook inspection and edits.
- Do not inspect or edit raw XLSX XML unless `openpyxl` or LibreOffice cannot
  perform the task.
