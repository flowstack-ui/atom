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
4. The component completes manual testing and workbook updates.
5. The completed component is committed.
6. The draft protocol is reviewed.
7. Once reviewed and considered stable, promote it to
   `manual-tests/<component>.md`.
8. Commit the reviewed protocol.

`.manual-tests/` contains temporary draft protocols and is created only when a
draft is active. This folder contains reviewed, version-controlled regression
protocols. Do not promote a draft until the component has successfully
completed manual testing and workbook updates.

The protocol folder is not the coverage index. The workbook remains the status
source of truth, including completed baseline coverage that predates the current
protocol workflow. Any future substantial update to a component without a
reviewed protocol must create, execute, review, and promote one through the
documented lifecycle.
