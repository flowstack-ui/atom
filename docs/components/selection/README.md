# Selection

`useSelection` owns record IDs, not roles, focus, layout or form submission.
Import `useSelection` and `useSelectionCheckbox` from
`@flowstack-ui/atom/selection`. Finished Brick consumers use its public adapter.

```tsx
const selection = useSelection({ orderedKeys: records.map(record => record.id) });
// Inside a row component (hooks must not be called directly inside a loop):
const checkbox = useSelectionCheckbox({ selection, value: record.id, rangeSelection: true });
return <Checkbox.Root {...checkbox} aria-label={`Select ${record.name}`} />;
```

## Behavior

`orderedKeys` is the explicit current action/range scope. `selectedKeys` and
`defaultSelectedKeys` accept readonly string arrays; callbacks receive a new
readonly array. `mode` defaults to `multiple`; `single` accepts at most one ID.
Keys must be nonempty strings, ordered keys unique. Invalid inputs throw.
Selected IDs outside the current page/filter remain selected until reconciled.
Unmounting is not deletion. Reconcile deleted IDs with `setSelection`.

`disabledKeys`, `disabled` and `readOnly` guard user mutations. `setSelection`
is explicit reconciliation and may include offscreen IDs. All mutations are
blocked when the collection is disabled/read-only. Existing disabled selected
IDs remain selected. `isSelected`, `canSelect` and `selectedKeys` describe the
committed render. Controlled callbacks propose changes, never commit props.

## Operations

`setSelected`, `toggle`, `clearSelection`, `setSelection`, `selectRange`,
`setScopeSelected` and `getScopeState` provide bounded state operations.
Scope state is `none`, `some` or `all` among eligible scope IDs. An empty scope
is `none`. Scope operations preserve selected IDs outside their scope. In
single mode, selecting a multi-key scope throws. Range is inclusive and skips
disabled items. A missing anchor falls back to the target. Changing order resets
the checkbox gesture anchor. No server-wide all-results sentinel is supported.

## Accessibility

`useSelectionCheckbox({ selection, value, rangeSelection })` returns props for
Atom Checkbox, not arbitrary native input props. Spread the complete binding;
do not replace its click/keyboard/change handlers. It handles optional Shift
click and Shift+Space. Give every checkbox an accessible name. Use the normal
Checkbox mixed-state contract and explicit scope methods for a header checkbox.
No row should become a button simply because its data can be selected.

No automatic filtering, persistence, fetching, sorting or form reset is supplied.
No CSS or visual anatomy is required. Keep one selection state across alternate
table/list/card views. Use Listbox for a composite option picker, not this hook
alone. Keyboard arrow navigation does not come from selection state.

## Data Attributes

Selection renders no DOM and adds no data attributes. Checkbox bindings preserve
the public Checkbox state attributes and native form semantics.
