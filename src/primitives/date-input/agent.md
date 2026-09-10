# DateInput agent guide

## Purpose

Locale-ordered segmented date entry with independent incomplete editing.

## Use when

- Locale-ordered segmented date entry with independent incomplete editing.

## Choose something else when

- An event scheduler or business availability workflow is required. Use Application-owned composition.

## Required composition

- Use DateInput.Root and its named parts. Supply a stable referenceDate, accessible names and a typed selectionMode value.
- Use date-value helpers for date-only, local datetime and zoned datetime values; never parse localized strings with Date.parse.

## Rules

- **MUST:** Keep editing, selection, validation and overlay state with the owning components; do not nest independent popup engines.
- **MUST:** Supply referenceDate consistently on server and client; locale and timeZone must agree.

## Common mistakes

- **Avoid:** Converting a date-only value to UTC midnight. **Instead:** Preserve the civil date and serialize explicitly.

## Validation checklist

- Verify selection modes, keyboard, form reset/validation, locale/RTL, controlled values and public imports.

## Related guidance

- `field`
- `popover`
