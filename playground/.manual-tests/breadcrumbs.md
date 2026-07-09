# Breadcrumbs Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Breadcrumb scenario selected. Default toolbar state.

Action

Load the playground and open `Breadcrumb` from the top menu.

Verify

□ Scenario title shows `Breadcrumb`
□ Anatomy panel renders `Root`, `List`, `Item: Home`, `Link: Home`, `Separator`, `Item: Ellipsis`, `Ellipsis`, `Item: Projects`, `Link: Projects`, `Item: Page`, and `Page`
□ Canvas renders `Home`, `Projects`, `Atom playground`, separators, and an ellipsis
□ Canvas toolbar shows `Content`, `ARIA`, `Composition`, and `Props`
□ Canvas footer shows `Ellipsis true | Separator default`
□ Canvas Source tab opens and shows `Breadcrumb.Root` JSX
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Default toolbar state. Props off. Composition `Default` for every part. Ellipsis on. Custom Separator off.

Action

Confirm the default Breadcrumb feature state.

Verify

□ Canvas renders `Home`, an ellipsis, `Projects`, and `Atom playground`
□ Canvas renders default `/` separators between visible crumbs
□ Footer shows `Ellipsis true | Separator default`

Action

Turn `Content > Ellipsis` off.

Verify

□ Ellipsis is removed from Canvas
□ Anatomy marks `Item: Ellipsis` and `Ellipsis` as not rendered
□ Source removes `Breadcrumb.Ellipsis`
□ Footer shows `Ellipsis false | Separator default`

Action

Turn `Content > Custom Separator` on.

Verify

□ Separators render `>`
□ Anatomy `Separator` row shows `Content: custom`
□ Source shows explicit `Breadcrumb.Separator` children
□ Footer shows `Ellipsis false | Separator custom`

Reset

Turn `Ellipsis` on. Turn `Custom Separator` off.

## Step 2: Root

Setup

Default toolbar state. Root composition `Default`. Props off. `ARIA > Root ariaLabel` off.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `nav`
□ ARIA includes `aria-label="Breadcrumb"`
□ Data includes `data-slot="breadcrumb"`
□ Root rows show `Composition: default` and `Ref target: nav`
□ List is nested under the Root with no duplicate Root wrapper
□ Source omits `ariaLabel="Demo breadcrumb"` from `Breadcrumb.Root`

Action

Turn `ARIA > Root ariaLabel` on.

Verify

□ Root ARIA changes to `aria-label="Demo breadcrumb"`
□ Source includes `ariaLabel="Demo breadcrumb"` on `Breadcrumb.Root`

Action

Turn `ARIA > Root ariaLabel` off.

Verify

□ Root ARIA falls back to `aria-label="Breadcrumb"`
□ Source omits `ariaLabel="Demo breadcrumb"` from `Breadcrumb.Root`

Reset

Turn `ARIA > Root ariaLabel` on.

Action

Set `Composition > Root` to `As Child`, then `Render`.

Verify

□ Root Attributes tag changes to `section`
□ ARIA still includes `aria-label="Demo breadcrumb"`
□ Data still includes the active Root `data-slot`
□ Ref target changes to `section`
□ Source reflects the selected Root composition

Action

Turn on `Props > Prop Check` and `Props > Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`
□ Root Data includes `data-slot="breadcrumb-root-custom"`
□ Anatomy `Root` continues showing live Attributes, ARIA, and Data for the custom slot element
□ Source includes `data-prop-check="root"` and `data-slot="breadcrumb-root-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Root Slot` off. Turn `ARIA > Root ariaLabel` off. Set Root composition `Default`.

## Step 3: List

Setup

Default toolbar state. List composition `Default`. Props off.

Action

Open Anatomy `List`.

Verify

□ Attributes tag is `ol`
□ Data includes `data-slot="breadcrumb-list"`
□ List rows show `Composition: default` and `Ref target: ol`
□ Breadcrumb items and separators are direct list children

Action

Set `Composition > List` to `As Child`, then `Render`.

Verify

□ List Attributes tag remains `ol`
□ Data still includes the active List `data-slot`
□ Ref target remains `ol`
□ Source reflects the selected List composition

Action

Turn on `Props > Prop Check` and `Props > List Slot`.

Verify

□ List Data includes `data-prop-check="list"`
□ List Data includes `data-slot="breadcrumb-list-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > List Slot` off. Set List composition `Default`.

## Step 4: Item

Setup

Default toolbar state. Item composition `Default`. Props off. Ellipsis on.

Action

Open Anatomy `Item: Home`, `Item: Ellipsis`, `Item: Projects`, and `Item: Page`.

Verify

□ Each rendered Item Attributes tag is `li`
□ Each rendered Item Data includes `data-slot="breadcrumb-item"`
□ `Item: Home` rows show `Composition: default` and `Ref target: li`
□ Items appear in page hierarchy order

Action

Set `Composition > Item` to `As Child`, then `Render`.

Verify

□ Each rendered Item Attributes tag remains `li`
□ Item Data still includes the active Item `data-slot`
□ `Item: Home` Ref target remains `li`
□ Source reflects the selected Item composition for every rendered item

Action

Turn on `Props > Prop Check` and `Props > Item Slot`.

Verify

□ Home Item Data includes `data-prop-check="item-home"`
□ Ellipsis Item Data includes `data-prop-check="item-ellipsis"`
□ Projects Item Data includes `data-prop-check="item-projects"`
□ Page Item Data includes `data-prop-check="item-page"`
□ Each rendered Item Data includes `data-slot="breadcrumb-item-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Item Slot` off. Set Item composition `Default`.

## Step 5: Link

Setup

Default toolbar state. Link composition `Default`. Props off.

Action

Open Anatomy `Link: Home` and `Link: Projects`.

Verify

□ Each Link Attributes tag is `a`
□ Home Link Attributes include `href="#home"`
□ Projects Link Attributes include `href="#projects"`
□ Each Link Data includes `data-slot="breadcrumb-link"`
□ `Link: Home` rows show `Composition: default` and `Ref target: a`

Action

Click `Home`, then click `Projects`.

Verify

□ Logs include `link clicked home`
□ Logs include `link clicked projects`
□ Focused Inspector can show the active link after keyboard or pointer focus

Action

Set `Composition > Link` to `As Child`, then `Render`.

Verify

□ Link Attributes tag remains `a`
□ Link Data still includes the active Link `data-slot`
□ Link clicks still log the selected label
□ Source reflects the selected Link composition

Action

Turn on `Props > Prop Check` and `Props > Link Slot`.

Verify

□ Home Link Data includes `data-prop-check="link-home"`
□ Projects Link Data includes `data-prop-check="link-projects"`
□ Each Link Data includes `data-slot="breadcrumb-link-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Link Slot` off. Set Link composition `Default`. Clear logs.

## Step 6: Page

Setup

Default toolbar state. Page composition `Default`. Props off.

Action

Open Anatomy `Page`.

Verify

□ Attributes tag is `span`
□ Text is `Atom playground`
□ ARIA includes `aria-current="page"`
□ Data includes `data-slot="breadcrumb-page"`
□ Page rows show `Composition: default` and `Ref target: span`
□ Page does not expose link role or disabled state

Action

Set `Composition > Page` to `As Child`, then `Render`.

Verify

□ Page Attributes tag remains `span`
□ ARIA still includes `aria-current="page"`
□ Data still includes the active Page `data-slot`
□ Ref target remains `span`
□ Source reflects the selected Page composition

Action

Turn on `Props > Prop Check` and `Props > Page Slot`.

Verify

□ Page Data includes `data-prop-check="page"`
□ Page Data includes `data-slot="breadcrumb-page-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Page Slot` off. Set Page composition `Default`.

## Step 7: Separator

Setup

Default toolbar state. Separator composition `Default`. Props off. Custom Separator off.

Action

Open Anatomy `Separator`.

Verify

□ Attributes tag is `li`
□ Attributes include `role="presentation"`
□ ARIA includes `aria-hidden="true"`
□ Data includes `data-slot="breadcrumb-separator"`
□ Separator text is `/`
□ Separator rows show `Composition: default`, `Content: default`, and `Ref target: li`

Action

Turn `Content > Custom Separator` on.

Verify

□ Separator text changes to `>`
□ Separator rows show `Content: custom`
□ Source shows explicit `Breadcrumb.Separator` children

Action

Set `Composition > Separator` to `As Child`, then `Render`.

Verify

□ Separator Attributes tag remains `li`
□ Attributes still include `role="presentation"`
□ ARIA still includes `aria-hidden="true"`
□ Data still includes the active Separator `data-slot`
□ Source reflects the selected Separator composition

Action

Turn on `Props > Prop Check` and `Props > Separator Slot`.

Verify

□ Separator Data includes `data-prop-check="separator"`
□ Separator Data includes `data-slot="breadcrumb-separator-custom"`

Reset

Turn `Custom Separator` off. Turn `Props > Prop Check` off. Turn `Props > Separator Slot` off. Set Separator composition `Default`.

## Step 8: Ellipsis

Setup

Default toolbar state. Ellipsis composition `Default`. Props off. Ellipsis on.

Action

Open Anatomy `Ellipsis`.

Verify

□ Attributes tag is `span`
□ Text is an ellipsis glyph
□ ARIA includes `aria-label="Show collapsed pages"`
□ ARIA does not include `aria-hidden`
□ Data includes `data-slot="breadcrumb-ellipsis"`
□ Ellipsis rows show `Composition: default` and `Ref target: span`

Action

Set `Composition > Ellipsis` to `As Child`, then `Render`.

Verify

□ Ellipsis Attributes tag changes to `button`
□ Attributes include `type="button"`
□ ARIA still includes `aria-label="Show collapsed pages"`
□ ARIA does not include `aria-hidden`
□ Data still includes the active Ellipsis `data-slot`
□ Ref target changes to `button`
□ Source reflects the selected Ellipsis composition

Action

Turn on `Props > Prop Check` and `Props > Ellipsis Slot`.

Verify

□ Ellipsis Data includes `data-prop-check="ellipsis"`
□ Ellipsis Data includes `data-slot="breadcrumb-ellipsis-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Ellipsis Slot` off. Set Ellipsis composition `Default`.

## Step 9: Source

Setup

Default toolbar state. Props off. Composition `Default` for every part. `ARIA > Root ariaLabel` off.

Action

Open Canvas Source.

Verify

□ Source shows `Breadcrumb.Root`, `Breadcrumb.List`, `Breadcrumb.Item`, `Breadcrumb.Link`, `Breadcrumb.Separator`, `Breadcrumb.Ellipsis`, and `Breadcrumb.Page`
□ Source omits the optional `ariaLabel` prop from `Breadcrumb.Root`
□ Source formats nested parts and multi-prop opening tags across readable lines
□ Source omits playground classes, refs, inspection attributes, and log handlers
□ Source omits `data-prop-check` while Prop Check is off
□ Source omits custom `data-slot` props while slot toggles are off

Action

Turn `ARIA > Root ariaLabel` on.

Verify

□ Source uses the consumer prop `ariaLabel="Demo breadcrumb"` on `Breadcrumb.Root`
□ Root DOM renders native `aria-label="Demo breadcrumb"`

Reset

Turn `ARIA > Root ariaLabel` off.

Action

Turn on `Props > Prop Check`, `Props > Root Slot`, `Props > List Slot`, `Props > Link Slot`, and `Props > Page Slot`.

Verify

□ Source includes the active `data-prop-check` props
□ Source includes selected custom `data-slot` props
□ Source remains valid consumer-facing JSX

Action

Set each Composition control to `As Child`, then set each to `Render`.

Verify

□ Source updates each selected part to the selected composition mode
□ Source does not show stale composition props after controls change

Reset

Turn `Props > Prop Check` off. Turn all enabled slot toggles off. Set every Composition control to `Default`.

## Step 10: Inspector / Logs

Setup

Default toolbar state. Props off. Logs clear.

Action

Click Root, List, Home Link, Separator, Ellipsis, Projects Link, and Page in the Canvas.

Verify

□ Inspector `Selected` updates to the clicked element
□ Inspector `Selected` shows filtered Attributes, ARIA, and Data
□ Inspector `Focused` remains separate from `Selected`
□ Clicking Home and Projects adds log rows
□ Clear removes log rows and leaves the scenario rendered

Action

Use keyboard Tab to focus the Home link, Projects link, and interactive Ellipsis when Ellipsis composition is `As Child` or `Render`.

Verify

□ Inspector `Focused` updates to the focused element
□ Focus evidence includes the same raw Attribute, ARIA, and Data groups

Reset

Clear logs. Set Ellipsis composition `Default`.

## Step 11: Workbook Cleanup / Rewrite Notes

□ Rows for keyboard arrow navigation, Home/End navigation, disabled item behavior, typeahead/search, and roving focus do not appear playground-verifiable for Breadcrumb because the public docs and source expose no managed focus or collection keyboard behavior.
□ Generic composition rows should be split or clarified by public part because Breadcrumb supports `asChild` and `render` on every part.
□ Ref rows are playground-verifiable through Anatomy `Ref target` rows for representative rendered parts.
□ Prop and custom slot rows are playground-verifiable through `Props > Prop Check` and per-part slot toggles.
