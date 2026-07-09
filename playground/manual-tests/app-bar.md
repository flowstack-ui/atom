# App Bar Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

App Bar scenario selected. Default toolbar state.

Action

Load the playground and open App Bar from the top menu.

Verify

□ Scenario title shows `App Bar`
□ Anatomy panel renders `Root`, `Toolbar`, `Start`, `Center`, and `End` in that order
□ Canvas renders an app bar with `Flowstack`, `Dashboard`, and a `Settings` button
□ Canvas toolbar shows `Layout`, `Composition`, and `Props`
□ Canvas Source tab opens and shows `AppBar.Root` JSX
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Default toolbar state. Props off. Composition `Default` for every part.

Action

Set `Layout > Position` to `Sticky`, `Fixed`, `Absolute`, then `Static`.

Verify

□ Root Data updates `data-position` to the selected value
□ Footer updates to the selected position
□ Source updates `position="..."`
□ App Bar remains rendered once with no duplicate wrappers

Action

Set `Layout > Density` to `Compact`, then `Comfortable`.

Verify

□ Toolbar Data updates `data-density` to the selected value
□ Footer updates to the selected density
□ Source updates `density="..."`

Reset

Set Position `Static`. Set Density `Comfortable`.

## Step 2: Root

Setup

Default toolbar state. Root composition `Default`. Props off.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `header`
□ Data includes `data-slot="appbar"`
□ Data includes `data-position="static"`
□ ARIA includes `aria-label="Demo app bar"`
□ Root rows show `Position: static`, `Composition: default`, and `Ref target: header`
□ Toolbar is nested under the Root with no extra root wrapper

Action

Set `Composition > Root` to `As Child`, then `Render`.

Verify

□ Root Attributes tag changes to `section`
□ Data still includes the active Root `data-slot`
□ Data still includes `data-position="static"`
□ ARIA still includes `aria-label="Demo app bar"`
□ Ref target changes to `section`
□ Source reflects the selected Root composition

Action

Turn on `Props > Prop Check` and `Props > Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`
□ Root Data includes `data-slot="appbar-custom"`
□ Anatomy `Root` continues showing live Attributes, ARIA, and Data for the custom slot element
□ Source includes `data-prop-check="root"` and `data-slot="appbar-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Root Slot` off. Set Root composition `Default`.

## Step 3: Toolbar

Setup

Default toolbar state. Toolbar composition `Default`. Props off.

Action

Open Anatomy `Toolbar`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="appbar-toolbar"`
□ Data includes `data-density="comfortable"`
□ ARIA does not include `role="toolbar"`
□ Toolbar rows show `Density: comfortable`, `Composition: default`, and `Ref target: div`

Action

Set `Layout > Density` to `Compact`.

Verify

□ Toolbar Data changes to `data-density="compact"`
□ Source changes to `density="compact"`

Action

Set `Composition > Toolbar` to `As Child`, then `Render`.

Verify

□ Toolbar Attributes tag changes to `nav`
□ Data still includes the active Toolbar `data-slot`
□ Data still includes the selected `data-density`
□ Ref target changes to `nav`
□ Start, Center, and End remain children of the toolbar element
□ Source reflects the selected Toolbar composition

Action

Turn on `Props > Prop Check` and `Props > Toolbar Slot`.

Verify

□ Toolbar Data includes `data-prop-check="toolbar"`
□ Toolbar Data includes `data-slot="appbar-toolbar-custom"`
□ Anatomy `Toolbar` continues showing live Attributes and Data for the custom slot element

Reset

Set Density `Comfortable`. Turn `Props > Prop Check` off. Turn `Props > Toolbar Slot` off. Set Toolbar composition `Default`.

## Step 4: Start

Setup

Default toolbar state. Start composition `Default`. Props off.

Action

Open Anatomy `Start`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="appbar-start"`
□ Start text is `Flowstack`
□ Start rows show `Composition: default` and `Ref target: div`

Action

Set `Composition > Start` to `As Child`, then `Render`.

Verify

□ Start Attributes tag changes to `span`
□ Data still includes the active Start `data-slot`
□ Start text remains `Flowstack`
□ Ref target changes to `span`
□ Source reflects the selected Start composition

Action

Turn on `Props > Prop Check` and `Props > Start Slot`.

Verify

□ Start Data includes `data-prop-check="start"`
□ Start Data includes `data-slot="appbar-start-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Start Slot` off. Set Start composition `Default`.

## Step 5: Center

Setup

Default toolbar state. Center composition `Default`. Props off.

Action

Open Anatomy `Center`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="appbar-center"`
□ Center text is `Dashboard`
□ Center rows show `Composition: default` and `Ref target: div`

Action

Set `Composition > Center` to `As Child`, then `Render`.

Verify

□ Center Attributes tag changes to `span`
□ Data still includes the active Center `data-slot`
□ Center text remains `Dashboard`
□ Ref target changes to `span`
□ Source reflects the selected Center composition

Action

Turn on `Props > Prop Check` and `Props > Center Slot`.

Verify

□ Center Data includes `data-prop-check="center"`
□ Center Data includes `data-slot="appbar-center-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Center Slot` off. Set Center composition `Default`.

## Step 6: End

Setup

Default toolbar state. End composition `Default`. Props off.

Action

Open Anatomy `End`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="appbar-end"`
□ End contains the `Settings` button
□ End rows show `Composition: default` and `Ref target: div`

Action

Click `Settings`.

Verify

□ Logs include `action settings`
□ The App Bar remains rendered

Action

Set `Composition > End` to `As Child`, then `Render`.

Verify

□ End Attributes tag changes to `span`
□ Data still includes the active End `data-slot`
□ `Settings` remains clickable
□ Ref target changes to `span`
□ Source reflects the selected End composition

Action

Turn on `Props > Prop Check` and `Props > End Slot`.

Verify

□ End Data includes `data-prop-check="end"`
□ End Data includes `data-slot="appbar-end-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > End Slot` off. Set End composition `Default`. Clear logs.

## Step 7: Source

Setup

Default toolbar state. Canvas Source tab open.

Action

Change Position, Density, one Composition mode, Prop Check, and one custom Slot.

Verify

□ Source updates after each toolbar change
□ Source shows only Atom JSX for the live App Bar scenario
□ Source omits default `position="static"` and `density="comfortable"`
□ Source includes non-default `position`, non-default `density`, composition, `data-prop-check`, and custom `data-slot` values
□ Source omits playground-only refs, classes, logs, and inspection plumbing

Reset

Return Position `Static`, Density `Comfortable`, all Composition controls `Default`, Prop Check off, and custom Slots off.

## Step 8: Inspector / Logs

Setup

Default toolbar state. Canvas tab open. Logs clear.

Action

Click the Root, Toolbar, Start, Center, End, and Settings button in the canvas.

Verify

□ Selected Inspector updates to the clicked element
□ Selected Inspector shows raw Attributes, ARIA, and Data for Atom parts
□ Focused Inspector updates when keyboard focus moves to `Settings`
□ Focused Inspector shows the button while `Settings` has focus
□ Logs remain empty until `Settings` is activated

Action

Activate `Settings`.

Verify

□ Logs include `action settings`
□ Clear removes the log entry

## Step 9: Workbook Cleanup / Rewrite Notes

Workbook cleanup completed after this protocol passed.

□ Removed stale `BarCenter`, `BarToolbar`, and generic `Section` rows; they do not match public App Bar anatomy
□ Kept ref rows covered through Anatomy `Ref target` evidence
□ Removed `asChild lets preventDefault block Atom behavior where supported`; App Bar is a static structural primitive with no preventable Atom behavior
□ Marked remaining App Bar rows `yes` / `yes` / `covered` with `manual-tests/app-bar.md` evidence
