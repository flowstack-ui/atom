# CheckboxGroup Completeness Manual Test Protocol (Draft)

Status: draft — do not promote until owner testing and workbook review pass.

Use the Checkbox Group playground page. Run one numbered section at a time in
chat and stop for the tester's result. Inspect the selected part in Anatomy or
Inspector when a step names an ARIA or data attribute.

## 1. Default complete family

1. Open `Selection` > `Checkbox Group` and keep the default controlled state.
2. Confirm Email is checked, SMS and Push are unchecked, and Parent announces
   or exposes `aria-checked="mixed"`.
3. Confirm Anatomy includes Root, Parent, all three Items, Item Label, Item
   Description, and the generated hidden input.
4. Confirm Source includes Root `allValues`, Parent, ItemLabel, and
   ItemDescription.
5. Confirm Email Item's `aria-labelledby` references the visible `Email
   updates` part and its `aria-describedby` references `Account and product
   notices`; confirm both referenced IDs exist exactly once.

Pass condition: every public part is rendered, the default partial selection
is deterministic, and no stale or missing ARIA relationship appears.

## 2. Parent aggregate behavior

1. Activate Parent from the default mixed state with pointer or touch.
2. Confirm Email, SMS, and Push become checked, Parent becomes checked, and one
   value-change event records all three values.
3. Activate Parent again. Confirm all three Items clear, Parent becomes
   unchecked, and one value-change event records `none`.
4. Select only SMS. Confirm Parent becomes mixed.
5. Focus Parent and repeat select-all and clear-all with Space, then Enter.

Pass condition: none/some/all state is correct and every Parent activation
produces one group update without submitting a separate Parent value.

## 3. State inheritance and blocked interaction

1. Turn Disabled on and try Parent plus each Item. Confirm none changes and
   disabled state appears on Root, Parent, and Items.
2. Turn Disabled off, turn Read only on, and repeat. Confirm none changes while
   controls remain exposed as read-only.
3. Turn Read only off and toggle Invalid. Confirm Root, Parent, and Items expose
   invalid state without changing selection.
4. Turn Required on, clear all Items, and inspect native validity. Confirm the
   group is invalid until any Item is selected and only selected Items appear
   under the `updates` form name.
5. Turn Push disabled on. Confirm direct and Parent interaction cannot change
   Push while its disabled state is active; record any disagreement between the
   aggregate declared-value contract and the disabled Item behavior as a bug.

Pass condition: inherited state is visible and interaction is blocked exactly
where the public state says it is blocked.

## 4. Composition and native surface

1. Test composition in Default, As Child, and Render modes.
2. In every mode, confirm Parent and every Item remain one focusable checkbox
   button, ItemLabel and ItemDescription use the displayed composed tag, and
   checked behavior, value, naming, and description relationships stay intact.
3. Enable Prop Check. Confirm Root, Parent, each Item, ItemLabel, and
   ItemDescription retain their documented custom data prop.
4. Enable the Root, Parent, Item, Item Label, and Item Description custom slots
   independently. Confirm only the selected part receives the custom slot and
   behavior and ARIA remain unchanged.
5. Switch orientation between vertical and horizontal. Confirm only metadata
   and visual layout change; keyboard activation remains Space and Enter.

Pass condition: composition, native props, slots, and orientation preserve the
same semantic control contract.

## 5. Controlled, uncontrolled, and hydration

1. Return to defaults and turn Controlled off. Change several Items and confirm
   uncontrolled state remains interactive and Parent follows it.
2. Reload the page and confirm there are no console hydration warnings,
   duplicate IDs, or broken ARIA references.
3. Return Controlled on and confirm externally owned selection remains stable.

Pass condition: both state modes, reload/hydration, and available reset behavior
preserve complete-family state and relationships.

## 6. Accessibility and mobile regression

1. On desktop, Tab through the group and activate Parent and Items using only
   the keyboard. Confirm visible focus and no extra tab stops from hidden
   inputs.
2. With VoiceOver or another available screen reader, confirm Parent announces
   unchecked, mixed, and checked states and Email announces both its name and
   description.
3. On a phone or tablet using the LAN playground URL, repeat Parent select-all,
   one Item toggle, disabled/read-only blocking, and the structured Email
   announcement.
4. At 200% and 400% zoom or the closest mobile text/zoom equivalent, confirm
   every control remains reachable without clipping or horizontal page loss.
5. Confirm no console errors or stuck pointer/touch state after the sweep.

Pass condition: keyboard, assistive technology, touch, zoom, and responsive
behavior preserve the same complete CheckboxGroup contract.
