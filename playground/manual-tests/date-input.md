# DateInput manual protocol

Route: select DateInput in the workbench. Edge cases: /__tests/dates.
Overall result: blocked, not performed. Real AT, physical touch and actual zoom remain unqualified.

1. Inspect native hosts, accessible names and public parts.
2. Navigate/edit with arrows, select with Enter, and verify focus with VoiceOver and NVDA.
3. Exercise controlled/uncontrolled, disabled/read-only, required, bounds and unavailable dates.
4. Verify supported selection modes, localized digits, RTL and multiple-month focus.
5. Check canonical submission, partial invalid entry and reset; preserve local and zoned date-time meaning.
6. DatePicker: open at viewport edges and inside Dialog; verify topmost Escape and focus return.
7. Repeat at actual 200%/400% zoom and on physical touch devices. Record environment and failures before marking coverage complete.
