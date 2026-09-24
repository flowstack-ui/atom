# Record selection and primary actions

Status: automated harness added; manual assistive-technology and physical-device
checks have not been performed. This is not completed manual qualification.

Open `/__tests/record-selection`. The table keeps native table semantics.

1. Activate Select alpha, then Shift-click Select gamma. Expected selected IDs:
   alpha, beta, gamma; Opened remains zero.
2. Focus Select delta and press Shift+Space. All four IDs are selected once;
   focus stays on the same checkbox. Repeat to clear that range.
3. Click alpha's record text. Opened increases once; selection is unchanged.
4. Click Receipt alpha, Menu alpha, then Portal receipt. Only Actions increases;
   the portal click must not activate the row.
5. Use Enter on Open alpha. It activates once. The row adds no extra tab stop.
6. Select record text and release the pointer. It must not open the record.
7. Modifier/middle clicks on row space must not activate it. Native navigation
   affordances belong to the actual link, not blank row space.
8. On a named touch device, tap the checkbox, row space and secondary control;
   verify independent outcomes. Scroll/drag/cancel must not activate a record.
9. With VoiceOver or NVDA, verify native table navigation and named checked
   state. The row is not announced as a button or selected grid row.

Automated counterparts: `selection.spec.ts`, `action-delegate.spec.ts`, and
`record-selection.mobile.spec.ts`. Emulation does not qualify physical devices.
