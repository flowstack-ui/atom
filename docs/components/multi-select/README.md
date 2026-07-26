# MultiSelect

Headless compact multi-value selection primitives.

## When to use

Use MultiSelect when users choose several values from a predefined moderate
collection and the options should stay collapsed until requested. Use
CheckboxGroup for a short visible choice set, Listbox when the collection
should remain visible, Select for one value, and Combobox when editable
filtering is required.

## Import

```tsx
import { MultiSelect } from "@flowstack-ui/atom/multi-select";
```

## Anatomy

```tsx
<MultiSelect.Root defaultValue={["design"]} name="skills">
  <MultiSelect.Trigger>
    <MultiSelect.Value placeholder="Choose skills" />
    <MultiSelect.Icon />
  </MultiSelect.Trigger>
  <MultiSelect.Content>
    <MultiSelect.ScrollUpButton />
    <MultiSelect.Viewport>
      <MultiSelect.Group>
        <MultiSelect.Label>Skills</MultiSelect.Label>
        <MultiSelect.Item value="design">
          <MultiSelect.ItemText>Design</MultiSelect.ItemText>
          <MultiSelect.ItemIndicator />
        </MultiSelect.Item>
      </MultiSelect.Group>
    </MultiSelect.Viewport>
    <MultiSelect.ScrollDownButton />
    <MultiSelect.Arrow />
  </MultiSelect.Content>
</MultiSelect.Root>
```

## API Reference

### Root

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string[]` | - |
| `defaultValue` | `string[]` | `[]` |
| `onValueChange` | `(value: string[]) => void` | - |
| `open` / `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` / `readOnly` / `invalid` / `required` | `boolean` | Field value / `false` |
| `name` / `form` | `string` | - |
| `validationBehavior` | `"native" \| "inline"` | Field/Form value |

Values are deduplicated in first-occurrence order. Item activation toggles one
value without closing Content. Uncontrolled value and open state return to
their defaults on form reset.

## Parts

- `Trigger` renders a button and owns `aria-expanded`, `aria-haspopup`,
  `aria-controls`, Field label/description relationships, state data, native
  props, ref, `asChild`, and `render`.
- `Value` renders the placeholder for zero values, one label for one value, or
  `First (+N more)` for several. `renderValue(values, labels)` customizes the
  summary without changing behavior.
- `Content` and its `Listbox` alias render the positioned popup, portal by
  default, and expose `data-side`, `data-align`, and `data-positioned`.
- `Viewport`, scroll buttons, and `Arrow` own the specialized overflow and
  positioned-popup anatomy.
- `Item` requires `value`, accepts `label` and `disabled`, exposes option ARIA,
  checked/highlighted/disabled data, and stays open after toggling.
- `ItemText`, `ItemIndicator`, `Group`, `Label`, and `Separator` preserve the
  complete collection anatomy.
- `Portal` accepts `container` and `disabled`.

## Accessibility and keyboard

Trigger is a button that opens a focusable popup listbox; it is deliberately
not `role="combobox"` because the APG combobox value model is single-select.
Content has `role="listbox"` and `aria-multiselectable="true"`; Items have
`role="option"` and `aria-selected`.

- Arrow keys move the active option without changing selection.
- Home/End move to the first/last enabled option.
- Space or Enter toggles the active option and keeps Content open.
- Printable keys use option labels for typeahead.
- Escape closes and restores Trigger focus.
- Tab and touch-safe outside interaction close the popup.

## Forms and Field

When named or required, Root renders an accessibility-hidden native multiple
select containing every declared Item. It carries the selected values, name,
form, disabled, and required state; redirects invalid focus to Trigger; and
uses Atom's Field/Form validation and reset infrastructure. Item labels are
collected statically so closed values and native options work before the popup
mounts.

## Data Attributes

- Trigger and Content expose `data-state="open|closed"`; Content also exposes
  resolved `data-side`, `data-align`, and `data-positioned`.
- Item exposes `data-state="checked|unchecked"`, `data-value`, and optional
  `data-highlighted` and `data-disabled`.
- Stateful parts expose `data-disabled`, `data-readonly`, and `data-invalid`
  where those states apply. Every rendered part exposes an overridable
  `data-slot`.

## Scope

MultiSelect intentionally excludes editable filtering, arbitrary tags,
creation, select-all, range selection, virtualization, async loading, and
mandatory chips. Those require separate interaction contracts.

## Evidence

- `test/primitives/multi-select.test.mjs`
- `playground/manual-tests/multi-select.md`
- playground `multi-select` scenario and `MultiSelect` workbook sheet
