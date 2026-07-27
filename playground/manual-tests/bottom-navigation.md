# Bottom Navigation Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Bottom Navigation scenario selected. Default toolbar state.

Action

Load the playground and open `Bottom Navigation` from the top menu.

Verify

□ Scenario title shows `Bottom Navigation`
□ Anatomy panel renders `Root`, `Item: Home`, `Item: Search`, and `Item: Settings`
□ Canvas renders Home, Search, and Settings destinations
□ Canvas toolbar shows `State`, `Value`, `Layout`, `Composition`, and `Props`
□ Canvas footer shows `Value home | Labels always | Position static`
□ Canvas Source tab opens and shows `BottomNavigation.Root` JSX with `ariaLabel`
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Default toolbar state. Props off. Root composition `Default`. Item composition `Default`. Controlled on. Label Visibility `always`. Position `static`. Disabled Item on. Link Item off. Block Search Event off.

Action

Click `Search`.

Verify

□ Footer changes to `Value search | Labels always | Position static`
□ `Item: Search` Data includes `data-state="active"`
□ `Item: Search` ARIA includes `aria-current="page"`
□ Logs include `destination changed to search`

Action

Use `Value > Controlled Value` to select `Home`.

Verify

□ Footer changes to `Value home | Labels always | Position static`
□ Home becomes active and Search becomes inactive
□ Logs include `destination changed to home`

Action

Turn `Controlled` off. Click `Search`, then click `Home`.

Verify

□ Uncontrolled clicks update the active item
□ Footer follows each destination change
□ Logs include one destination-change row for each click

Action

Set `Label Visibility` to `active`, select Search, then set it to `hidden`.

Verify

□ With `active`, only Search includes `data-label-visible`
□ With `hidden`, no item includes `data-label-visible`
□ Root Data reports the selected `data-label-visibility` value

Action

Turn `Link Item` on.

Verify

□ `Item: Search` Attributes tag is `a`
□ `Item: Search` Attributes include `href="#search"`
□ `Item: Search` Attributes include `target="_blank"`
□ `Item: Search` Attributes include `rel="noreferrer"`

Action

Click disabled `Settings`.

Verify

□ Active value does not change to `settings`
□ `Item: Settings` ARIA includes `aria-disabled="true"`
□ `Item: Settings` Data includes `data-disabled`
□ Logs do not add `destination changed to settings`

Action

Turn `Block Search Event` on. Click `Search`.

Verify

□ Active value does not change to `search`
□ Logs include `search event prevented`
□ Logs do not add a new `destination changed to search` row for the blocked click

Reset

Turn `Controlled` on. Use `Value > Controlled Value` to select `Home`. Set Label Visibility to `always`. Turn `Link Item` off. Turn `Block Search Event` off.

## Step 2: Root

Setup

Default toolbar state. Props off. Root composition `Default`.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `nav`
□ ARIA includes `aria-label="Demo bottom navigation"`
□ Data includes `data-slot="bottom-nav-root"`
□ Root rows show `Controlled: true`, `Label visibility: always`, `Position: static`, `Composition: default`, and `Ref target: nav`

Action

Select each `Layout > Position` value.

Verify

□ Root Data reports `data-position="static"`, `sticky`, `fixed`, and `absolute` respectively
□ Footer and Source report the same selected position
□ Position changes do not change selection, keyboard behavior, or element semantics

Action

Set `Composition > Root: As Child`, then `Render`.

Verify

□ Attributes tag remains `nav`
□ Data still includes `data-slot="bottom-nav-root"`
□ Destination clicks still change active value
□ Source reflects the selected Root composition

Action

Turn on `Props > Prop Check` and `Props > Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`
□ Root Data includes `data-slot="bottom-nav-root-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Root Slot` off. Set Root composition `Default`.

## Step 3: Item

Setup

Default toolbar state. Props off. Item composition `Default`. Disabled Item on. Link Item off.

Action

Open Anatomy `Item: Home`.

Verify

□ Attributes tag is `button`
□ Attributes include `type="button"`
□ Data includes `data-slot="bottom-nav-item"`
□ Data includes `data-value="home"`
□ Data includes `data-state="active"`
□ Data includes `data-active`
□ Data includes `data-label-visible`
□ Item rows show `Composition: default` and `Ref target: button`

Action

Open Anatomy `Item: Search`.

Verify

□ Attributes tag is `button`
□ Data includes `data-value="search"`
□ Data includes `data-state="inactive"`
□ ARIA does not include `aria-current`

Action

Open Anatomy `Item: Settings`.

Verify

□ Attributes tag is `button`
□ Attributes include `disabled`
□ ARIA includes `aria-disabled="true"`
□ Data includes `data-disabled`
□ Data includes `data-state="inactive"`

Action

Set `Composition > Item: As Child`, then `Render`.

Verify

□ Item Data still includes `data-slot="bottom-nav-item"`
□ Item Data still includes the correct `data-value`
□ Active and disabled data still follow state
□ Source reflects the selected Item composition

Action

Turn on `Props > Prop Check` and `Props > Item Slot`.

Verify

□ Home Data includes `data-prop-check="item-home"`
□ Search Data includes `data-prop-check="item-search"`
□ Settings Data includes `data-prop-check="item-settings"`
□ Each item Data includes `data-slot="bottom-nav-item-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Item Slot` off. Set Item composition `Default`.

## Step 4: Source

Setup

Default toolbar state. Source tab open.

Action

Toggle each Bottom Navigation toolbar control one at a time.

Verify

□ Controlled on shows `value="home"` and `onChange={setValue}`
□ Root accessible-name prop is shown as `ariaLabel="Demo bottom navigation"`
□ Controlled off shows `defaultValue="home"` and omits `value`
□ Non-default Label Visibility values show the matching `labelVisibility` prop
□ Non-default Position values show the matching `position` prop
□ Default `always` and `static` values are omitted from Source while their data attributes remain inspectable
□ Link Item on shows Search with `href="#search"`, `target="_blank"`, and `rel="noreferrer"`
□ Block Search Event on shows Search with `onClick={(event) => event.preventDefault()}`
□ Disabled Item on shows Settings with `disabled`
□ Root and Item composition modes change the Source JSX
□ Prop Check and custom slot toggles add only the expected `data-prop-check` and `data-slot` props

Reset

Return toolbar state to defaults and switch back to Canvas.

## Step 5: Inspector / Logs

Setup

Default toolbar state. Canvas visible. Logs clear.

Action

Click Home, Search, and Settings in the Canvas, then inspect `Selected`, `Focused`, and `Logs`.

Verify

□ Selected shows raw Attributes, ARIA, and Data for the clicked destination
□ Focused updates independently from Selected when focus moves
□ Logs record enabled destination changes
□ Logs do not record a value change for disabled Settings
□ Clear removes all log rows and the footer event count returns to `0`

## Step 6: Focus Behavior

Setup

Default toolbar state. Canvas focused.

Action

Use `Tab` to move through the Bottom Navigation items.

Verify

□ Enabled button destinations receive native focus
□ Disabled Settings is skipped or not focusable
□ Focused Inspector shows the active element's tag, ARIA, and Data
□ No arrow-key, Home/End, or typeahead behavior is expected for this component unless package docs add it later

## Step 7: Workbook Cleanup / Rewrite Notes

□ `NavigationItem` rows appear stale; public docs and exports list only `Root` and `Item`
□ Keyboard rows for arrow keys, Home/End, disabled roving focus, and typeahead appear stale or not playground-verifiable because Bottom Navigation uses native button/anchor semantics and docs do not define composite keyboard navigation
□ Workbook rows for custom slots and Prop Check should be updated after manual testing because the playground now exposes those controls
□ Workbook should not be updated until this protocol passes
