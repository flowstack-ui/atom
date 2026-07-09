# NavList Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

NavList scenario selected. Default toolbar state.

Action

Load the playground and open `NavList` from the top menu.

Verify

□ Scenario title shows `NavList`
□ Anatomy panel renders `Root`, `Section`, `Section Label`, `Section Trigger`, `Section Content`, `List`, `Item: Overview`, `Link: Overview`, `Item: Settings`, `Link: Settings`, `Item: Archive`, and `Link: Archive`
□ Canvas renders Workspace, Project, Overview, Settings, and Archive
□ Canvas toolbar shows `State`, `Section`, `Layout`, `Composition`, and `Props`
□ Canvas footer shows `vertical | Active overview | Open true`
□ Canvas Source tab opens and shows `NavList.Root` JSX with `aria-label="Project navigation"`
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Default toolbar state. Props off. All composition controls set to `Default`. Collapsible Section on. Controlled Section off. Default Open on. Force Mount off. Disable Project Trigger off. Disable Archive off. `aria-current` set to `page`.

Action

Click `Settings`.

Verify

□ Canvas footer changes to `vertical | Active settings | Open true`
□ `Link: Settings` Data includes `data-current`
□ `Link: Settings` Data includes `data-active`
□ `Link: Settings` ARIA includes `aria-current="page"`
□ Logs include `active link settings`

Action

Click `Project`.

Verify

□ Canvas footer changes to `vertical | Active settings | Open false`
□ `Section` Data includes `data-state="closed"`
□ `Section Trigger` ARIA includes `aria-expanded="false"`
□ `Section Content` Anatomy group is inactive
□ Logs include `section closed`

Action

Turn `Force Mount` on.

Verify

□ `Section Content` renders while closed
□ `Section Content` Attributes include `hidden`
□ `Section Content` Data includes `data-state="closed"`

Action

Click `Project` to reopen the section. Change `aria-current` to `step`.

Verify

□ Current link ARIA changes to `aria-current="step"`
□ Current link remains the only link with `data-current`

Action

Turn `Controlled Section` on. Use `Close`, then `Open`.

Verify

□ Close changes the footer to `Open false`
□ Open changes the footer to `Open true`
□ Source uses `open={true}` or `open={false}` with `onOpenChange={setSectionOpen}`

Action

Turn `Controlled Section` off. Turn `Default Open` off, then on.

Verify

□ Default Open off remounts the uncontrolled section closed
□ Default Open on remounts the uncontrolled section open
□ Source uses `defaultOpen` when Default Open is on and does not include `open={...}`

Action

Change `Orientation` to `horizontal`. Turn `Ordered List` on.

Verify

□ Root Data includes `data-orientation="horizontal"`
□ Workspace is centered above the horizontal navigation row
□ Project appears as the bold trigger on the left of the row
□ Overview, Settings, and Archive appear to the right of Project when open
□ Collapsing Project hides the links to the right while Project remains visible
□ List Attributes tag is `ol`
□ List Data includes `data-ordered`
□ Section, Trigger, Label, Content, Item, and Link Data include `data-orientation="horizontal"`

Action

Turn `Disable Project Trigger` on. Click `Project`.

Verify

□ Section remains open
□ Section Data includes `data-disabled`
□ Section Trigger Data includes `data-disabled`
□ Project trigger appears disabled
□ Section Trigger cannot toggle the section

Action

Turn `Disable Archive` on. Click `Archive`.

Verify

□ Footer active value does not change to `archive`
□ `Link: Archive` ARIA includes `aria-disabled="true"`
□ `Link: Archive` Attributes include `tabindex="-1"`
□ `Link: Archive` Attributes do not include `href="#archive"`
□ `Item: Archive` Data includes `data-disabled`

Reset

Set Orientation `vertical`. Turn Ordered List off. Turn Force Mount off. Turn Disable Project Trigger off. Turn Disable Archive off. Turn Controlled Section off. Turn Default Open on. Ensure Project is open. Set `aria-current` to `page`. Click Overview.

## Step 2: Root

Setup

Default toolbar state. Props off. Root composition `Default`.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `nav`
□ ARIA includes `aria-label="Project navigation"`
□ Data includes `data-slot="nav-list"`
□ Data includes `data-orientation="vertical"`
□ Root rows show `Orientation: vertical`, `Composition: default`, and `Ref target: nav`

Action

Set `Composition > Root: As Child`, then `Render`.

Verify

□ Attributes tag changes to `section`
□ Data still includes `data-slot="nav-list"`
□ Data still includes `data-orientation="vertical"`
□ Link clicks still update active state
□ Source reflects the selected Root composition

Action

Turn on `Props > Prop Check` and `Props > Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`
□ Root Data includes `data-slot="nav-list-root-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Root Slot` off. Set Root composition `Default`.

## Step 3: Section

Setup

Default toolbar state. Props off. Section composition `Default`. Collapsible Section on. Controlled Section off. Default Open on. Disable Project Trigger off.

Action

Open Anatomy `Section`.

Verify

□ Attributes tag is `section`
□ Data includes `data-slot="nav-list-section"`
□ Data includes `data-state="open"`
□ Data includes `data-collapsible`
□ Section rows show `Collapsible: true`, `Controlled: false`, `Default open: true`, `Disabled: false`, `Composition: default`, and `Ref target: section`

Action

Set `Composition > Section: As Child`, then `Render`.

Verify

□ Attributes tag remains `section`
□ Data still includes `data-slot="nav-list-section"`
□ Section open/close behavior still works
□ Source reflects the selected Section composition

Action

Turn on `Props > Prop Check` and `Props > Section Slot`.

Verify

□ Section Data includes `data-prop-check="section"`
□ Section Data includes `data-slot="nav-list-section-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Section Slot` off. Set Section composition `Default`.

## Step 4: Section Label

Setup

Default toolbar state. Props off. Label composition `Default`.

Action

Open Anatomy `Section Label`.

Verify

□ Attributes tag is `h3`
□ Data includes `data-slot="nav-list-section-label"`
□ Data includes `data-orientation="vertical"`
□ Section Label rows show `Composition: default` and `Ref target: h3`

Action

Set `Composition > Label: As Child`, then `Render`.

Verify

□ Attributes tag changes to `h4`
□ Data still includes `data-slot="nav-list-section-label"`
□ Section Content `aria-labelledby` matches the Section Label id
□ Source reflects the selected Label composition

Action

Turn on `Props > Prop Check` and `Props > Section Label Slot`.

Verify

□ Section Label Data includes `data-prop-check="section-label"`
□ Section Label Data includes `data-slot="nav-list-section-label-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Section Label Slot` off. Set Label composition `Default`.

## Step 5: Section Trigger

Setup

Default toolbar state. Props off. Trigger composition `Default`. Collapsible Section on. Controlled Section off. Default Open on. Disable Project Trigger off.

Action

Open Anatomy `Section Trigger`.

Verify

□ Attributes tag is `button`
□ Attributes include `type="button"`
□ Data includes `data-slot="nav-list-section-trigger"`
□ Data includes `data-state="open"`
□ Data includes `data-collapsible`
□ ARIA includes `aria-expanded="true"`
□ `aria-controls` matches the Section Content id
□ Section Trigger rows show `Composition: default` and `Ref target: button`

Action

Focus `Project`. Press Space, then Enter.

Verify

□ Space toggles the section closed
□ Enter toggles the section open
□ Logs include one row for each section open change

Action

Set `Composition > Trigger: As Child`, then `Render`.

Verify

□ Attributes tag remains `button`
□ Attributes include `type="button"`
□ ARIA and Data state still follow section open state
□ Source reflects the selected Trigger composition

Action

Turn on `Props > Prop Check` and `Props > Section Trigger Slot`.

Verify

□ Section Trigger Data includes `data-prop-check="section-trigger"`
□ Section Trigger Data includes `data-slot="nav-list-section-trigger-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Section Trigger Slot` off. Set Trigger composition `Default`. Ensure Project is open.

## Step 6: Section Content

Setup

Default toolbar state. Props off. Content composition `Default`. Controlled Section on. Use `Open Section`. Force Mount off.

Action

Open Anatomy `Section Content`.

Verify

□ Attributes tag is `div`
□ Data includes `data-slot="nav-list-section-content"`
□ Data includes `data-state="open"`
□ ARIA includes `aria-labelledby` matching the Section Label id
□ Section Content rows show `Composition: default` and `Ref target: div`

Action

Use `Close Section`.

Verify

□ Section Content Anatomy group is inactive
□ Section Content is not present in Canvas

Action

Turn `Force Mount` on.

Verify

□ Section Content renders while closed
□ Attributes include `hidden`
□ Data includes `data-state="closed"`

Action

Set `Composition > Content: As Child`, then `Render`.

Verify

□ Attributes tag remains `div`
□ Data and ARIA relationships remain present
□ Source reflects the selected Content composition

Action

Turn on `Props > Prop Check` and `Props > Section Content Slot`.

Verify

□ Section Content Data includes `data-prop-check="section-content"`
□ Section Content Data includes `data-slot="nav-list-section-content-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Section Content Slot` off. Set Content composition `Default`. Use `Open Section`. Turn Force Mount off. Turn Controlled Section off.

## Step 7: List

Setup

Default toolbar state. Props off. List composition `Default`. Ordered List off.

Action

Open Anatomy `List`.

Verify

□ Attributes tag is `ul`
□ Data includes `data-slot="nav-list-list"`
□ Data includes `data-orientation="vertical"`
□ List rows show `Composition: default` and `Ref target: ul`

Action

Turn `Ordered List` on.

Verify

□ Attributes tag changes to `ol`
□ Data includes `data-ordered`
□ Source includes `ordered`

Action

Set `Composition > List: As Child`, then `Render`.

Verify

□ Attributes tag remains `ol`
□ Data still includes `data-slot="nav-list-list"`
□ Source reflects the selected List composition

Action

Turn on `Props > Prop Check` and `Props > List Slot`.

Verify

□ List Data includes `data-prop-check="list"`
□ List Data includes `data-slot="nav-list-list-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > List Slot` off. Set List composition `Default`. Turn Ordered List off.

## Step 8: Item

Setup

Default toolbar state. Turn Disable Archive on. Props off. Item composition `Default`.

Action

Open Anatomy `Item: Overview`.

Verify

□ Attributes tag is `li`
□ Data includes `data-slot="nav-list-item"`
□ Data includes `data-orientation="vertical"`
□ Item rows show `Composition: default` and `Ref target: li`

Action

Open Anatomy `Item: Archive`.

Verify

□ Attributes tag is `li`
□ Data includes `data-disabled`
□ Data includes `data-slot="nav-list-item"`

Action

Set `Composition > Item: As Child`, then `Render`.

Verify

□ Attributes tag remains `li`
□ Data still includes `data-slot="nav-list-item"`
□ Archive item Data still includes `data-disabled`
□ Source reflects the selected Item composition

Action

Turn on `Props > Prop Check` and `Props > Item Slot`.

Verify

□ Item Overview Data includes `data-prop-check="item-overview"`
□ Item Settings Data includes `data-prop-check="item-settings"`
□ Item Archive Data includes `data-prop-check="item-archive"`
□ Each item Data includes `data-slot="nav-list-item-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Item Slot` off. Set Item composition `Default`.

## Step 9: Link

Setup

Default toolbar state. Turn Disable Archive on. Props off. Link composition `Default`. `aria-current` set to `page`. Active link Overview.

Action

Open Anatomy `Link: Overview`.

Verify

□ Attributes tag is `a`
□ Attributes include `href="#overview"`
□ Data includes `data-slot="nav-list-link"`
□ Data includes `data-active`
□ Data includes `data-current`
□ ARIA includes `aria-current="page"`
□ Link rows show `Composition: default` and `Ref target: a`

Action

Click `Settings`.

Verify

□ `Link: Settings` becomes current
□ `Link: Overview` no longer includes `data-current`
□ Logs include `active link settings`

Action

Set `aria-current` to `location`.

Verify

□ Current link ARIA changes to `aria-current="location"`
□ Current link Data still includes `data-current`

Action

Open Anatomy `Link: Archive`.

Verify

□ Attributes tag is `a`
□ Attributes include `tabindex="-1"`
□ Attributes do not include `href="#archive"`
□ ARIA includes `aria-disabled="true"`
□ Data includes `data-disabled`

Action

Set `Composition > Link: As Child`, then `Render`.

Verify

□ Attributes tag remains `a`
□ Active/current and disabled evidence still follows state
□ Source reflects the selected Link composition

Action

Turn on `Props > Prop Check` and `Props > Link Slot`.

Verify

□ Link Overview Data includes `data-prop-check="link-overview"`
□ Link Settings Data includes `data-prop-check="link-settings"`
□ Link Archive Data includes `data-prop-check="link-archive"`
□ Each link Data includes `data-slot="nav-list-link-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Link Slot` off. Set Link composition `Default`. Set `aria-current` to `page`. Click Overview.

## Step 10: Source

Setup

Default toolbar state. Source tab open.

Action

Change Orientation, Ordered List, Force Mount, Controlled Section, Default Open, Disable Project Trigger, `aria-current`, each Composition control, Prop Check, and several Slot controls.

Verify

□ Source updates after each changed toolbar control
□ Source shows only Atom JSX and consumer usage
□ Source includes active, current, controlled open, defaultOpen, disabled, ordered, forceMount, composition, data-prop-check, and custom data-slot props only when the matching toolbar state requires them
□ Source does not include playground refs, logs, classes, inspectors, or helper component names

Reset

Return toolbar controls to default state.

## Step 11: Inspector / Logs

Setup

Default toolbar state. Turn Disable Archive on. Inspector visible. Logs cleared.

Action

Click Root, Section Trigger, Section Label, Overview link, Settings link, and Archive link.

Verify

□ Selected tab updates to the clicked element
□ Focused tab separately tracks the focused element
□ Selected and Focused show Attributes, ARIA, and Data groups
□ Logs include active-link changes for enabled link clicks
□ Logs do not add an active-link change for Archive when Disable Archive is on

Action

Click `Project` twice.

Verify

□ Logs include `section closed`
□ Logs include `section opened`
□ Logs footer count updates

## Step 12: Nested / Portal / Focus Behavior

Setup

Default toolbar state. Turn Disable Archive on. Ensure Project is open.

Action

Use Tab to move through the NavList controls in Canvas.

Verify

□ Focus moves through Project, Overview, and Settings in document order
□ Archive link is skipped because it has `tabindex="-1"` when Disable Archive is on
□ NavList does not expose `role="tree"` or `aria-activedescendant`
□ Arrow keys, Home, End, and typeahead do not perform roving-focus navigation

## Workbook Cleanup / Rewrite Notes

□ Remove or rewrite rows for non-public pseudo-parts: `ListItem`, `ListLink`, `ListList`, `ListSection`, `ListSectionContent`, `ListSectionLabel`, and `ListSectionTrigger`
□ Rewrite `Root currentValue prop behavior`; current NavList source does not implement `currentValue`
□ Rewrite `Link value prop behavior`; current NavList source does not implement `value`
□ Remove keyboard rows for arrow navigation, Home/End navigation, typeahead/search, and roving focus; public docs say NavList uses normal native Tab navigation
□ Rewrite composition rows that imply NavList-level preventDefault behavior; only supported part behavior should be tested
□ After manual testing passes, update workbook rows to cover real public parts: Root, Section, SectionTrigger, SectionLabel, SectionContent, List, Item, and Link
