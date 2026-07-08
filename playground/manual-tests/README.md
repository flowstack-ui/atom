# Manual Test Protocols

This folder holds reviewed Manual Test Protocol files for playground
components. Files here are version-controlled regression protocols.

A Manual Test Protocol is a saved, step-by-step QA procedure for one component.
Keep protocols part-first, concise, and executable one step at a time.
Protocols should guide tester verification; they should not explain component
implementation, become prose component documentation, or copy workbook rows.

Follow the canonical authoring guide in
[`docs/component-testing.md`](../docs/component-testing.md).

## Lifecycle

1. Codex generates a draft protocol in `.manual-tests/`.
2. The draft is executed during manual testing.
3. The draft is improved based on real testing results.
4. Once reviewed and considered stable, promote it to
   `manual-tests/<component>.md`.

Do not add a component protocol here until it has been reviewed and confirmed
during real testing.
