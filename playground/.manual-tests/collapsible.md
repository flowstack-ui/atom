# Collapsible Manual Test Protocol

Run one step at a time in chat. Stop after each step until the tester confirms pass or reports an issue.

## Step 0: Playground Smoke Check

Setup

Default playground state. Workbook closed or left unchanged.

Action

1. Open the playground.
2. From the top menu, choose `Utilities` > `Collapsible`.
3. Open the `Anatomy`, `Canvas`, and `Inspector` workbench areas.
4. In Canvas, switch to `Source`, then switch back to `Canvas`.

Verify

□ Page title is `Collapsible`.
□ Workbench order is `Anatomy`, `Canvas`, then `Inspector`.
□ Canvas toolbar groups include `State`, `Composition`, and `Props`.
□ Canvas shows a `Details` trigger.
□ Canvas footer shows `Closed | Uncontrolled | Keep mounted false`.
□ Anatomy groups are in public order: `Root`, `Trigger`, `Content`.
□ Inspector tabs are `Selected`, `Focused`, and `Logs`.
□ Source starts with `<Collapsible.Root`.
□ Source includes `<Collapsible.Trigger>Details</Collapsible.Trigger>`.
□ Source includes `<Collapsible.Content>More information</Collapsible.Content>`.
□ `component-coverage.xlsx` is not updated.

## Step 1: Feature-Wide State

Setup

Default toolbar state: `Controlled` off, `Disabled` off, `Keep mounted` off, `Block trigger` off, all composition controls set to `Default`, `Prop Check` off, all custom slot controls off. `Open` is hidden while `Controlled` is off.

Action

1. Click `Details`.
2. Click `Details` again.
3. Enable `Controlled`.
4. In `Controlled Value`, enable `Open`.
5. Disable `Open`.
6. Disable `Controlled`.
7. Enable `Keep mounted`.
8. Click `Details`, then click `Details` again.
9. Enable `Disabled`.
10. Click `Details`.
11. Disable `Disabled`.
12. Enable `Block trigger`.
13. Click `Details`.

Verify

□ Uncontrolled click opens Root and Trigger with `data-state="open"` and logs `opened`.
□ Second uncontrolled click closes Root and Trigger with `data-state="closed"` and logs `closed`.
□ With `Controlled` on, `Controlled Value` > `Open` controls the rendered state.
□ With `Keep mounted` on after closing, Content remains rendered with `hidden` and `data-state="closed"`.
□ With `Disabled` on, Root and Trigger expose disabled state and click does not open content.
□ With `Block trigger` on, click logs `trigger click blocked` and does not toggle open state.

Reset

Return all State controls to default.

## Step 2: Root

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Root`.

Action

1. Inspect Root in Anatomy.
2. Enable `Props` > `Prop Check`.
3. Enable `Props` > `Root Slot`.
4. Set Root composition to `As Child`.
5. Set Root composition to `Render`.
6. Set Root composition to `Default`.

Verify

Identity

□ Default tag is `div`.
□ Default Data includes `data-slot="collapsible-root"`.
□ Default Data includes `data-state="closed"`.
□ Default Data does not include `data-prop-check`.
□ `Ref target` row is `div`.

Props / Slots

□ With `Prop Check` on, Data includes `data-prop-check="root"`.
□ With `Root Slot` on, Data includes `data-slot="collapsible-root-custom"`.

Composition

□ `As Child` Root tag is `section`, with no extra wrapper around Trigger and Content.
□ `Render` Root tag is `section`.
□ In both composition modes, Data keeps the active Root `data-slot` and `data-state`.

Reset

Set Root composition to `Default`; disable `Prop Check` and `Root Slot`.

## Step 3: Trigger

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Trigger`.

Action

1. Inspect Trigger in Anatomy.
2. Click `Details`.
3. Click `Details` again.
4. Enable `Disabled`.
5. Disable `Disabled`.
6. Enable `Props` > `Prop Check`.
7. Enable `Props` > `Trigger Slot`.
8. Set Trigger composition to `As Child`.
9. Set Trigger composition to `Render`.
10. Focus Trigger and press `Enter`.
11. Press `Space`.

Verify

Identity

□ Default tag is `button`.
□ Default Attributes include `type="button"`.
□ Default Data includes `data-slot="collapsible-trigger"`.
□ Default Data includes `data-state="closed"`.
□ Default Data does not include `data-prop-check`.
□ `Ref target` row is `button`.

ARIA

□ Closed Trigger has `aria-expanded="false"`.
□ Open Trigger has `aria-expanded="true"`.
□ `aria-controls` is present.
□ When Content is rendered, `aria-controls` matches the Content id.
□ Disabled Trigger has `aria-disabled="true"`.

Props / Slots

□ With `Prop Check` on, Data includes `data-prop-check="trigger"`.
□ With `Trigger Slot` on, Data includes `data-slot="collapsible-trigger-custom"`.

Composition

□ `As Child` Trigger tag is `span`.
□ `As Child` Trigger includes `role="button"` and `tabindex="0"`.
□ `Render` Trigger tag is `div`.
□ `Render` Trigger includes `role="button"` and `tabindex="0"`.

Interaction

□ Click toggles open and closed.
□ `Enter` toggles open state once.
□ `Space` toggles open state once.
□ Disabled Trigger blocks pointer and keyboard activation.

Reset

Set Trigger composition to `Default`; disable `Prop Check`, `Trigger Slot`, and `Disabled`.

## Step 4: Content

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Content`.

Action

1. Confirm Content is not rendered while closed.
2. Click `Details`.
3. Inspect Content in Anatomy.
4. Click `Details`.
5. Enable `Keep mounted`.
6. Inspect Content while closed.
7. Click `Details`.
8. Enable `Props` > `Prop Check`.
9. Enable `Props` > `Content Slot`.
10. Set Content composition to `As Child`.
11. Set Content composition to `Render`.

Verify

Identity

□ Closed with `Keep mounted` off: Content summary is `not rendered`.
□ Open default tag is `div`.
□ Open default role is `region`.
□ Open Data includes `data-slot="collapsible-content"`.
□ Open Data includes `data-state="open"`.
□ `Ref target` row is `div`.

ARIA

□ `aria-labelledby` matches the Trigger id.

Props / Slots

□ With `Prop Check` on, Data includes `data-prop-check="content"`.
□ With `Content Slot` on, Data includes `data-slot="collapsible-content-custom"`.
□ Open Content style includes `--content-height` with a pixel value related to rendered content height.

Composition

□ `As Child` Content tag is `section`.
□ `Render` Content tag is `section`.
□ In both composition modes, role remains `region`.

Interaction

□ With `Keep mounted` on and closed, Content remains rendered with `hidden` and `data-state="closed"`.

Reset

Set Content composition to `Default`; disable `Prop Check`, `Content Slot`, and `Keep mounted`; close Collapsible if open.

## Step 5: Source

Setup

Default toolbar state. Canvas Source visible.

Action

1. Toggle each State control one at a time.
2. Toggle Root, Trigger, and Content composition modes.
3. Toggle `Prop Check`.
4. Toggle each custom slot control.
5. Toggle `Block trigger`.

Verify

□ Source updates `open={open}` only when `Controlled` is on.
□ Source uses `defaultOpen={false}` when `Controlled` is off.
□ Source includes `disabled` only when `Disabled` is on.
□ Source includes `keepMounted` only when `Keep mounted` is on.
□ Source reflects Root, Trigger, and Content `asChild` modes.
□ Source reflects Root, Trigger, and Content `render` modes.
□ Source includes `data-prop-check="root"`, `data-prop-check="trigger"`, and `data-prop-check="content"` only when `Prop Check` is on.
□ Source includes custom `data-slot` values only for enabled slot controls.
□ Source includes `onClick={(event) => event.preventDefault()}` only when `Block trigger` is on.

Reset

Return toolbar state to default and switch Canvas back to `Canvas`.

## Step 6: Inspector / Logs

Setup

Default toolbar state. Canvas visible. Inspector visible.

Action

1. Click Root, Trigger, and rendered Content.
2. Focus Trigger by keyboard.
3. Click `Details` twice.
4. Enable `Block trigger` and click `Details`.
5. Clear logs.

Verify

□ `Selected` shows raw Attributes, ARIA, and Data for the last clicked inspectable part.
□ `Focused` shows Trigger evidence when Trigger has keyboard focus.
□ Logs record `opened` and `closed` after normal activation.
□ Logs record `trigger click blocked` when `Block trigger` prevents activation.
□ Clear logs leaves the log row area empty and event count at `0`.

Reset

Disable `Block trigger`.

## Step 7: Focus Behavior

Setup

Default toolbar state. Canvas visible.

Action

1. Focus Trigger with keyboard.
2. Press `Enter`.
3. Press `Space`.
4. Enable `Disabled`.
5. Try `Enter` and `Space` again.

Verify

□ Trigger receives visible focus.
□ `Enter` toggles state and focus stays on Trigger.
□ `Space` toggles state and focus stays on Trigger.
□ Disabled Trigger does not receive normal activation and does not toggle state.

Reset

Disable `Disabled`; close Collapsible if open.

## Workbook Cleanup / Rewrite Notes

□ Do not update `component-coverage.xlsx` until every protocol step passes.
□ Rows 1-2 were implementation gaps before this draft: Prop Check and custom slot controls.
□ Row 59 is playground-verifiable through `Block trigger`.
□ Ref rows are playground-verifiable through Anatomy `Ref target` rows.
□ `aria-controls` should be treated as a stable generated relationship when Content is rendered, not a literal id.
□ `--content-height` should be verified as a pixel value related to content height, not a fixed literal.
