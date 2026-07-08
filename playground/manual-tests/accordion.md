# Accordion Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Accordion scenario selected. Default toolbar state.

Action

Load the playground and open Accordion from the top menu.

Verify

□ Scenario title shows `Accordion`
□ Anatomy panel renders `Root`, then numbered `Item`, `Header`, `Trigger`, and `Content` groups for items `1`, `2`, and `3`
□ Canvas renders the `What does Accordion render by default?`, `How does state behave?`, and `Can disabled items be tested?` accordion triggers
□ Canvas toolbar shows `State`, `Keyboard`, `Composition`, and `Props`
□ Canvas Source tab opens and shows `Accordion.Root` JSX
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Props off. Composition default for every part. `Controlled` off. `Multiple` off. `Collapsible` on. `Disabled` off. `Disabled Item` on. `Keep Mounted` off. Orientation `Vertical`. Direction `Ltr`.

Action

Click `Item 1`, then click `Item 2`.

Verify

□ Single mode keeps only one enabled item open at a time
□ `Item 1` closes when `Item 2` opens
□ Footer changes from `single | Item 1` to `single | Item 2`
□ Logs include one `value changed to ...` row for each value change

Action

Click `Item 2` again.

Verify

□ `Item 2` closes when `Collapsible` is on
□ Footer shows `single | none`
□ `Item 1`, `Item 2`, and `Item 3` have `data-state="closed"`

Action

Click `Item 1`. Turn `Collapsible` off. Click `Item 1`.

Verify

□ `Item 1` remains open when `Collapsible` is off
□ Footer remains `single | Item 1`
□ No extra value-change log is added for the blocked collapse

Action

Turn `Collapsible` on. Turn `Multiple` on. Click `Item 2`.

Verify

□ `Collapsible` control is hidden while `Multiple` is on
□ `Item 1` and `Item 2` can be open at the same time
□ Footer shows `multiple | Item 1, Item 2`
□ Root Data includes `data-orientation="vertical"`
□ Open items have `data-state="open"`
□ Closed items have `data-state="closed"`

Action

Click `Item 1`.

Verify

□ Multiple mode lets `Item 1` close while `Item 2` stays open
□ Footer shows `multiple | Item 2`

Action

Turn `Controlled` on. Use `State > Value` to select `Item 1 + Item 2`, then `None`.

Verify

□ Toolbar value changes update the live Accordion
□ `Item 1 + Item 2` opens both enabled selected items
□ `None` closes all items
□ Logs include `external value set to ...`

Action

Use `State > Value` to select `Item 1`. Click `Item 2`.

Verify

□ Controlled value changes only through the toolbar-controlled value
□ `Item 2` click logs `value changed to Item 2`
□ Footer and open state follow the controlled value after the change callback

Action

Turn `Controlled` off. Turn `Multiple` off. Ensure `Item 1` is open. Turn `Disabled` on. Click `Item 1`, then click `Item 2`.

Verify

□ Root Data includes `data-disabled`
□ Trigger Data includes `data-disabled`
□ Trigger ARIA includes `aria-disabled="true"`
□ Pointer and keyboard activation do not change value while disabled

Action

Turn `Disabled` off. Ensure `Disabled Item` is on. Click `Item 3`.

Verify

□ `Item 3` remains closed
□ `Item 3` Data includes `data-disabled`
□ `Trigger: 3` ARIA includes `aria-disabled="true"`
□ Pointer activation does not change the value

Reset

Turn `Disabled` off. Turn `Controlled` off. Turn `Multiple` off. Ensure `Collapsible` is on and `Item 1` is open.

## Step 2: Root

Setup

Default toolbar state. Props off. Root composition `Default`.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="accordion-root"`
□ Data includes `data-orientation="vertical"`
□ Root rows show `Controlled: false`, `Collapsible: true`, `Disabled: false`, `Orientation: vertical`, `Direction: ltr`, `Value: Item 1`, `Composition: default`

Action

Set `Keyboard > Orientation: Horizontal`.

Verify

□ Root Data changes to `data-orientation="horizontal"`
□ Canvas changes to a side-by-side horizontal accordion layout
□ Source shows `orientation="horizontal"`

Action

Set `Keyboard > Direction: Rtl`.

Verify

□ The scenario remains rendered inside the canvas
□ Source wraps the example in `<Direction.Provider dir="rtl">`
□ Root rows show `Direction: rtl`

Action

Set `Composition > Root: As Child`, then `Render`.

Verify

□ Root Attributes tag changes to `section`
□ Data still includes `data-slot="accordion-root"`
□ Accordion behavior still works from trigger clicks
□ Source reflects the selected Root composition

Action

Turn on `Props > Prop Check` and `Props > Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`
□ Root Data includes `data-slot="accordion-root-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Root Slot` off. Set Root composition `Default`. Set Orientation `Vertical`. Set Direction `Ltr`.

## Step 3: Item

Setup

Default toolbar state. Props off. Item composition `Default`. `Item 3` remains disabled.

Action

Open Anatomy `Item: 1`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="accordion-item"`
□ Data includes `data-state="open"`
□ `Item: 1` row shows `Composition: default`

Action

Click `Item 2`.

Verify

□ `Item: 2` Data includes `data-state="open"`
□ `Item: 1` Data changes to `data-state="closed"`

Action

Open Anatomy `Item: 3`.

Verify

□ Data includes `data-slot="accordion-item"`
□ Data includes `data-disabled`
□ Data includes `data-state="closed"`

Action

Set `Composition > Item: As Child`, then `Render`.

Verify

□ Item Attributes tag changes to `section`
□ Item Data still includes `data-slot="accordion-item"`
□ Item Data still reflects current `data-state`
□ Source reflects the selected Item composition

Action

Turn on `Props > Prop Check` and `Props > Item Slot`.

Verify

□ Item Data includes `data-prop-check="item-general"`
□ Item Data includes `data-slot="accordion-item-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Item Slot` off. Set Item composition `Default`. Ensure `Item 1` is open.

## Step 4: Header

Setup

Default toolbar state. Props off. Header composition `Default`.

Action

Open Anatomy `Header: 1`.

Verify

□ Attributes tag is `h3`
□ Data includes `data-slot="accordion-header"`
□ `Header: 1` row shows `Composition: default`

Action

Set `Composition > Header: As Child`, then `Render`.

Verify

□ Header Attributes tag changes to `h4`
□ Data still includes `data-slot="accordion-header"`
□ Trigger remains nested inside the Header
□ Source reflects the selected Header composition

Action

Turn on `Props > Prop Check` and `Props > Header Slot`.

Verify

□ Header Data includes `data-prop-check="header-general"`
□ Header Data includes `data-slot="accordion-header-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Header Slot` off. Set Header composition `Default`.

## Step 5: Trigger

Setup

Default toolbar state. Props off. Trigger composition `Default`. `Item 1` open.

Action

Open Anatomy `Trigger: 1`.

Verify

□ Attributes tag is `button`
□ Attributes include `type="button"`
□ Data includes `data-slot="accordion-trigger"`
□ Data includes `data-state="open"`
□ ARIA includes `aria-expanded="true"`
□ `aria-controls` matches the associated Content id

Action

Click `Item 2`.

Verify

□ `Trigger: 2` Data changes to `data-state="open"`
□ `Trigger: 2` ARIA includes `aria-expanded="true"`
□ `Trigger: 1` Data changes to `data-state="closed"`
□ Logs include `value changed to Item 2`

Action

Keyboard focus `Item 2`, press `Enter`, then press `Space`.

Verify

□ `Enter` toggles the focused trigger
□ `Space` toggles the focused trigger
□ Focus remains on the trigger

Action

Open Anatomy `Trigger: 3`.

Verify

□ Data includes `data-disabled`
□ ARIA includes `aria-disabled="true"`
□ Pointer and keyboard activation do not open `Item 3`

Action

Set `Composition > Trigger: As Child`, then `Render`.

Verify

□ Trigger Attributes tag remains `button`
□ Trigger text remains visible
□ Data and ARIA still include the Accordion behavior attributes
□ Click and keyboard activation still work
□ Source reflects the selected Trigger composition

Action

Turn on `Props > Prop Check` and `Props > Trigger Slot`.

Verify

□ Trigger Data includes `data-prop-check="trigger-general"`
□ Trigger Data includes `data-slot="accordion-trigger-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Trigger Slot` off. Set Trigger composition `Default`. Ensure `Item 1` is open.

## Step 6: Content

Setup

Default toolbar state. Props off. Content composition `Default`. `Item 1` open.

Action

Open Anatomy `Content: 1`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="accordion-content"`
□ Data includes `data-state="open"`
□ ARIA includes `role="region"`
□ `aria-labelledby` matches the associated Trigger id

Action

Click `Item 2`.

Verify

□ `Content: 1` is removed from the DOM when closed and `Keep Mounted` is off
□ `Content: 2` renders with `data-state="open"`

Action

Turn `Keep Mounted` on. Click `Item 1`.

Verify

□ Closed content remains in the DOM
□ Closed content has `hidden` when not animating
□ Source shows `keepMounted`

Action

Set `Composition > Content: As Child`, then `Render`.

Verify

□ Content Attributes tag changes to `section`
□ Data still includes `data-slot="accordion-content"`
□ ARIA relationship to Trigger remains intact
□ Source reflects the selected Content composition

Action

Turn on `Props > Prop Check` and `Props > Content Slot`.

Verify

□ Content Data includes `data-prop-check="content"`
□ Content Data includes `data-slot="accordion-content-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Content Slot` off. Set Content composition `Default`. Turn `Keep Mounted` off. Ensure `Item 1` is open.

## Step 7: Keyboard And Focus Behavior

Setup

Default toolbar state. `Disabled Item` on. Orientation `Vertical`. Direction `Ltr`. Focus `Item 1` trigger.

Action

Press `ArrowDown`, `ArrowDown`, `ArrowUp`, `Home`, then `End`.

Verify

□ `ArrowDown` moves focus from `Item 1` to `Item 2`
□ Disabled `Item 3` is skipped by roving focus
□ `ArrowUp` moves focus back toward the previous enabled trigger
□ `Home` moves focus to the first enabled trigger
□ `End` moves focus to the last enabled trigger
□ Focused Inspector updates after each focus movement

Action

Set Orientation `Horizontal`. Focus `Item 1`. Press `ArrowRight`, then `ArrowLeft`.

Verify

□ `ArrowRight` moves focus to the next enabled trigger
□ `ArrowLeft` moves focus to the previous enabled trigger
□ Focused Inspector shows the focused trigger
□ Canvas remains in side-by-side horizontal layout

Action

Set Direction `Rtl`. Keep Orientation `Horizontal`. Focus `Item 1`. Press `ArrowRight`, then `ArrowLeft`.

Verify

□ `ArrowRight` and `ArrowLeft` mirror horizontal navigation under RTL
□ Focused Inspector shows the focused trigger after each mirrored movement
□ Source includes `<Direction.Provider dir="rtl">`

Reset

Set Orientation `Vertical`. Set Direction `Ltr`.

## Step 8: Source

Setup

Accordion scenario selected.

Action

Change these controls one at a time: `Controlled`, `Multiple`, `Collapsible`, `Disabled`, `Keep Mounted`, `Orientation`, `Direction`, each Composition part, `Props > Prop Check`, and each slot override.

Verify

□ Source updates after every control change
□ Source shows controlled `value` and `onValueChange` only when `Controlled` is on
□ Source shows `defaultValue` only when `Controlled` is off
□ Source omits default false booleans
□ Source uses boolean shorthand for enabled booleans
□ Source includes `asChild` and `render` only for selected composition modes
□ Source includes `Direction.Provider` only for `rtl`
□ Source includes `data-prop-check` only when Prop Check is on
□ Source includes custom `data-slot` values only when slot controls are on

## Step 9: Inspector / Logs

Setup

Default toolbar state. Clear logs.

Action

Click `Item 1`, click `Item 2`, then keyboard focus `Item 2`.

Verify

□ Selected Inspector shows the last clicked trigger or part
□ Focused Inspector shows the active trigger
□ Selected and Focused keep separate evidence
□ Attributes, ARIA, and Data groups use the same filtering style as Anatomy
□ Logs include value change rows and the footer event count updates

Action

Turn on Prop Check and one custom slot, then select the affected part.

Verify

□ Inspector Data shows `data-prop-check`
□ Inspector Data shows the custom `data-slot`
□ Turning controls off removes the test-only data from Inspector evidence

## Step 10: Workbook Cleanup / Rewrite Notes

Setup

Manual testing complete.

Action

Review Accordion workbook rows against passed protocol evidence.

Verify

□ Rows for props toolbar and slot overrides can be marked implemented only after manual testing passes
□ Rows for Root, Item, Header, Trigger, and Content composition map to visible controls
□ Direction/RTL rows can be tested through horizontal orientation plus `Direction.Provider dir="rtl"`
□ Ref rows should be classified before workbook updates because the current scenario does not expose consumer ref evidence directly
□ `--content-height` should be classified before workbook updates because style evidence is filtered from Anatomy and Inspector
□ Typeahead/search behavior row should be classified before workbook updates because Accordion docs do not document typeahead
