# Tabs Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Tabs scenario selected. Default toolbar state:

- Controlled off
- Loop on
- Disable Item off
- Keep Mounted off
- Focusable Panel off
- Indicator off
- Orientation horizontal
- Activation automatic
- Direction Default
- every Composition control set to Default
- Block Settings Event off
- every Props slot toggle off
- Prop Check off

Action

Open the Tabs scenario from the top menu. Expand Anatomy, select Root, open Source, and open Inspector tabs.

Verify

□ Scenario renders a tablist with Overview, Settings, and Billing triggers.
□ Anatomy lists Root, List, Trigger: Overview, Trigger: Settings, Trigger: Billing, Indicator, Content: Overview, Content: Settings, and Content: Billing in that order.
□ Indicator is marked not rendered.
□ Content: Overview is mounted; Settings and Billing content are marked not rendered.
□ Source shows `Tabs.Root defaultValue="overview"`, `Tabs.List`, three `Tabs.Trigger` parts, and three `Tabs.Content` parts.
□ Source does not show `value={value}`, `disabled`, `Tabs.Indicator`, `orientation`, `activationMode`, `loop`, `keepMounted`, `focusable`, `data-prop-check`, or custom `data-slot`.
□ Inspector tabs switch between Selected, Focused, and Logs.
□ Canvas footer reads `Uncontrolled overview | automatic | horizontal`.

## Step 1: Feature-Wide State

Setup

Default toolbar state. Logs cleared.

Action

Click Settings.

Verify

□ Settings trigger has `data-state="active"` and `aria-selected="true"`.
□ Overview trigger has `data-state="inactive"` and `aria-selected="false"`.
□ Settings panel is mounted with `role="tabpanel"` and `data-state="active"`.
□ Logs show `tab changed to settings`.

Action

Switch Controlled on. Set Controlled Value to Billing. Switch Controlled off.

Verify

□ Controlled mode Source shows `value={value}` and controlled value changes select the matching trigger.
□ Switching Controlled off returns Source to `defaultValue="overview"`.
□ The uncontrolled tab state remains usable by clicking triggers.

Action

Turn Keep Mounted on, then click Overview.

Verify

□ Inactive panels remain mounted with `hidden=""` and `data-state="inactive"`.
□ Active panel has no `hidden` attribute and has `data-state="active"`.

Reset

Controlled off. Keep Mounted off. Click Overview. Logs cleared.

## Step 2: Root

Setup

Default toolbar state.

Action

Inspect Root in Anatomy and Inspector. Toggle Root Slot. Toggle Prop Check. Change Root composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `div`.
□ Default `data-slot="tabs-root"`.
□ Default `data-orientation="horizontal"`.
□ Root Slot changes to `data-slot="tabs-root-custom"`.
□ Prop Check adds `data-prop-check="root"` only when enabled.
□ Ref target reports `div` in Default mode and `section` in As Child or Render mode.

Interaction

□ Direction Provider RTL wraps Source in `Direction.Provider dir="rtl"` and Root renders `dir="rtl"`.
□ Local RTL renders Root `dir="rtl"` without a provider wrapper.
□ Local LTR wraps Source in `Direction.Provider dir="rtl"` and Root renders `dir="ltr"`.

Composition

□ Default renders one Atom-owned `div`.
□ As Child merges Root props onto one `section`.
□ Render renders one custom `section` and preserves tab behavior.

Reset

Direction Default. Root Slot off. Prop Check off. Root composition Default.

## Step 3: List

Setup

Default toolbar state.

Action

Inspect List in Anatomy and Inspector. Toggle List Slot. Toggle Prop Check. Change List composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `div`.
□ `role="tablist"`.
□ `aria-label="Project sections"`.
□ `aria-orientation="horizontal"`.
□ Default `data-slot="tabs-list"`.
□ Default `data-orientation="horizontal"`.
□ List Slot changes to `data-slot="tabs-list-custom"`.
□ Prop Check adds `data-prop-check="list"` only when enabled.
□ Ref target reports `div`.

Composition

□ Default renders one Atom-owned `div`.
□ As Child merges List props onto one `div`.
□ Render renders one custom `div` and preserves keyboard navigation.

Reset

List Slot off. Prop Check off. List composition Default.

## Step 4: Trigger

Setup

Default toolbar state. Overview active.

Action

Inspect Trigger: Overview. Toggle Trigger Slot. Toggle Prop Check. Change Trigger composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `button`.
□ `type="button"`.
□ `role="tab"`.
□ Default `data-slot="tabs-trigger"`.
□ Trigger Slot changes to `data-slot="tabs-trigger-custom"`.
□ Prop Check adds `data-prop-check="trigger-overview"` only when enabled.
□ `data-value="overview"`.
□ Ref target reports `button`.

ARIA

□ Active trigger has `aria-selected="true"` and `tabindex="0"`.
□ Inactive triggers have `aria-selected="false"` and `tabindex="-1"`.
□ `aria-controls` matches the corresponding Content id.

Action

Turn Disable Item on and inspect Trigger: Billing.

Verify

□ Billing has `disabled=""`, `aria-disabled="true"`, and `data-disabled=""`.
□ Clicking Billing does not activate the Billing panel.

Composition

□ Default, As Child, and Render each preserve click activation, disabled behavior, and ARIA relationships.

Reset

Disable Item off. Trigger Slot off. Prop Check off. Trigger composition Default. Click Overview.

Action

Turn Block Settings Event on. Click Settings.

Verify

□ Settings does not activate because the consumer `onClick` called `event.preventDefault()`.
□ Source shows `onClick={(event) => event.preventDefault()}` only on the Settings trigger.

Reset

Block Settings Event off. Click Overview.

## Step 5: Indicator

Setup

Default toolbar state. Turn Indicator on.

Action

Inspect Indicator in Anatomy and Inspector. Toggle Indicator Slot. Toggle Prop Check. Click Settings.

Verify

Identity

□ Default tag is `div`.
□ Default `data-slot="tabs-indicator"`.
□ Default `data-orientation="horizontal"`.
□ Indicator Slot changes to `data-slot="tabs-indicator-custom"`.
□ Prop Check adds `data-prop-check="indicator"` only when enabled.
□ Indicator exposes CSS custom properties for active trigger position.
□ Indicator has no `data-state` attribute.

Interaction

□ Indicator remains mounted and updates position when the active trigger changes.

Reset

Indicator off. Indicator Slot off. Prop Check off. Click Overview.

## Step 6: Content

Setup

Default toolbar state. Overview active.

Action

Inspect Content: Overview. Toggle Content Slot. Toggle Prop Check. Toggle Focusable Panel. Change Content composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `div`.
□ `role="tabpanel"`.
□ Default `data-slot="tabs-content"`.
□ Default `data-state="active"`.
□ Content Slot changes to `data-slot="tabs-content-custom"`.
□ Prop Check adds `data-prop-check="content-overview"` only when enabled.
□ Ref target reports `div` in Default or As Child mode and `section` in Render mode.

ARIA

□ `aria-labelledby` matches the corresponding Trigger id.
□ Focusable Panel adds `tabindex="0"`.
□ With Focusable Panel off, no panel `tabindex` is rendered by default.

Action

Turn Keep Mounted on and click Settings.

Verify

□ Overview content remains mounted with `hidden=""` and `data-state="inactive"`.
□ Settings content has `data-state="active"` and no `hidden` attribute.

Composition

□ Default, As Child, and Render each preserve active/inactive panel behavior and ARIA relationships.

Reset

Keep Mounted off. Focusable Panel off. Content Slot off. Prop Check off. Content composition Default. Click Overview.

## Step 7: Keyboard And Direction

Setup

Default toolbar state. Overview trigger focused.

Action

Press ArrowRight, ArrowLeft, End, and Home.

Verify

□ ArrowRight moves focus to the next enabled trigger and activates it in automatic mode.
□ ArrowLeft moves focus to the previous enabled trigger and activates it in automatic mode.
□ End moves to the last enabled trigger.
□ Home moves to Overview.
□ With Loop off, arrow navigation does not wrap past the first or last enabled trigger.

Action

Set Activation to Manual. Focus Overview. Press ArrowRight, then press Enter or Space.

Verify

□ ArrowRight moves focus without changing the active panel.
□ Enter or Space activates the focused trigger.

Action

Set Direction to Provider RTL. Set Orientation horizontal. Focus Overview. Press ArrowRight, then ArrowLeft.

Verify

□ ArrowRight mirrors to the previous direction in RTL.
□ ArrowLeft mirrors to the next direction in RTL.

Action

Set Orientation vertical. Press ArrowDown and ArrowUp.

Verify

□ ArrowDown moves to the next enabled trigger.
□ ArrowUp moves to the previous enabled trigger.
□ Vertical navigation does not mirror in RTL.

Reset

Activation automatic. Direction Default. Orientation horizontal. Loop on. Click Overview.

## Step 8: Source

Setup

Default toolbar state.

Action

Toggle each State, Keyboard, Direction, Composition, and Props control one at a time, then inspect Source.

Verify

□ Default Source shows only `defaultValue="overview"` plus the required List label and child values.
□ Controlled mode shows `value={value}`.
□ Manual activation shows `activationMode="manual"`.
□ Vertical orientation shows `orientation="vertical"`.
□ Loop off shows `loop={false}`.
□ Disabled Billing shows `disabled` only on the Billing trigger.
□ Indicator on shows `Tabs.Indicator`.
□ Keep Mounted and Focusable Panel show `keepMounted` and `focusable` only when enabled.
□ Direction Provider RTL and Local LTR include `Direction.Provider dir="rtl"` when applicable.
□ Local Root direction shows `dir="ltr"` or `dir="rtl"` on `Tabs.Root`.
□ Composition controls add `asChild` or `render` only for the selected part.
□ Block Settings Event shows the prevent-default `onClick` only on the Settings trigger.
□ Prop Check and slot toggles show `data-prop-check` and custom `data-slot` props only when enabled.

Reset

Return all controls to default toolbar state.

## Step 9: Inspector / Logs

Setup

Default toolbar state. Logs cleared.

Action

Click Overview, Settings, and Billing. Select Root, List, a Trigger, Indicator when enabled, and active Content. Focus the same elements where possible.

Verify

□ Selected and Focused tabs update independently.
□ Raw Attributes, ARIA, and Data match the same selected parts shown in Anatomy.
□ Logs remain compact and show only tab-change events.
□ Clearing logs empties the Logs panel and resets the event count.

## Workbook Cleanup / Rewrite Notes

- Replace stale `forceMount` rows with `keepMounted`.
- Remove or rewrite Indicator `forceMount`, Indicator ref, and Indicator `data-state` rows because they are not in the verified source contract.
- Remove typeahead/search coverage; Tabs source does not implement typeahead.
- Treat the package docs `forceMount` and Indicator `data-state` entries as package documentation gaps, not playground behavior.
