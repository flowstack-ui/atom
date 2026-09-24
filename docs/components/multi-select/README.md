# MultiSelect

## Selection policy and popup positioning

`closeOnSelect` controls whether choosing an option closes the popup (Select:
true; MultiSelect: false). `loopFocus` defaults true for compatibility; false
stops Arrow navigation at the first/last enabled item. Control highlight with
`highlightedValue` and `onHighlightChange`, or initialize it with
`defaultHighlightedValue`. A controlled null means no highlighted option.

`positioning` accepts placement, strategy, gutter, flip, slide, overflowPadding,
sameWidth and hideWhenDetached. Highlight reveal remains within the positioned
popup; it never scrolls the document. `autoComplete` reaches the native form
proxy. Disabled options retain their native disabled state.

`MultiSelect.ClearTrigger` renders beside Trigger, never inside its button.
Supply an accessible localized name. Clearing respects disabled/read-only state,
closes the popup and returns focus without scrolling. Single Select additionally
accepts `deselectable` (false by default) to clear when choosing its current value.

Headless compact multi-value selection primitives.

## When to use

Use MultiSelect when users choose several values from a predefined moderate
collection and the options should stay collapsed until requested. Use
CheckboxGroup for a short visible choice set, Listbox when the collection
should remain visible, Select for one value, and Combobox when editable
filtering is required.

## Features

- Coordinates controlled and uncontrolled multi-value selection while keeping
  the popup open as options are toggled.
- Provides listbox semantics, roving option focus, typeahead, keyboard
  selection, focus restoration, and completed outside-interaction dismissal.
- Supports Field and Form relationships, native multiple-select
  participation, required validation, reset behavior, and disabled, readonly,
  and invalid states.
- Includes positioned popup, portal, viewport, group, label, separator,
  indicator, scroll-button, and arrow anatomy.

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
value without closing Content by default (`closeOnSelect={false}`). Set
`closeOnSelect` to close after selection. Uncontrolled value and open state return to
their defaults on form reset.

## Parts

- `Trigger` renders a button and owns `aria-expanded`, `aria-haspopup`,
  `aria-controls`, Field label/description relationships, state data, native
  props, ref, `asChild`, and `render`.
- `Value` renders the placeholder for zero values, one label for one value, or
  `First (+N more)` for several. `renderValue(values, labels)` customizes the
  summary without changing behavior.
- `Content` and its `Listbox` alias render the positioned popup, portal by
  default, expose `data-side`, `data-align`, and `data-positioned`, and accept
  `onInteractOutside(event)`. Calling `event.preventDefault()` keeps the popup
  open without cancelling the outside destination activation.
- `Viewport`, scroll buttons, and `Arrow` own the specialized overflow and
  positioned-popup anatomy.
- `Item` requires `value`, accepts `label` and `disabled`, exposes option ARIA,
  checked/highlighted/disabled data, and respects Root's `closeOnSelect` policy.
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
- Space or Enter toggles the active option and keeps Content open by default.
- Printable keys use option labels for typeahead.
- Escape closes and restores Trigger focus.
- Tab and completed mouse, touch, pen, or virtual outside activation close the
  popup; dragged and cancelled pointer sessions do not.

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
# Data, controllers and lifecycle

Pass `items={[{ value: "a", label: "Alpha", disabled: false }]}` when options
are rendered through opaque components or loaded asynchronously. These records
provide labels and native form options before the popup mounts. Keep rendered
Item values synchronized with the records. Selected values still submit when
their presentation is unmounted. Explicit records take precedence over cached
mounted labels.

`useMultiSelect(options)` returns the original controller for
`MultiSelect.RootProvider value={controller}`. Supply records to an external
controller. Its `context` exposes current value, isOpen, highlightedValue and
the same open/close/highlight/selection/clear actions used by the parts; do not
copy the controller or nest a second Root. The provider owns the native form
proxy. Controlled props remain authoritative.

Root supports `ids={{root, trigger, content}}`, `lazyMount` and
`unmountOnExit` (both true by default), `present`, and `onExitComplete`.
Retained closed content is hidden and inert. Exit timing follows authored CSS;
no animation is required. Presence does not change the open state.

`onPointerDownOutside`, `onFocusOutside` and `onEscapeKeyDown` can prevent
their respective dismissal. Content also supports `onInteractOutside`.
Portals default to the trigger's owner document, including iframe documents.

`onSelect(value)` observes option activation separately from value changes.
`scrollToIndexFn({ index, value })` delegates reveal to an application-owned
scroller. It does not add virtualization: keyboard registration still requires
mounted options. Omit it to use the popup-local reveal behavior.
