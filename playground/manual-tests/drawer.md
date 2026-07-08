# Drawer Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Drawer scenario selected. Default toolbar state.

Action

Load the playground and open Drawer from the top menu.

Verify

□ Scenario title shows `Drawer`  
□ Anatomy panel renders `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Title`, `Description`, `Close` in that order  
□ Canvas renders the `Open Drawer` trigger  
□ Canvas toolbar shows `State`, `Popup`, `Content`, `Dismiss`, `Composition`, `Props`  
□ Canvas Source tab opens and shows `Drawer.Root` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Props off. Composition `Trigger: Default`, `Close: Default`. State `Controlled` off, `Default open` off, `Disabled` off, `Keep mounted` off. Popup `Disable Portal` off, `Custom Container` off, `Placement: End`. Dismiss `Escape closes` on, `Backdrop closes` on, `Disable Overlay` off.

Action

Click `Open Drawer`.

Verify

□ Trigger has `data-state="open"`  
□ Overlay renders with `data-slot="drawer-overlay"`  
□ Content renders with `role="dialog"` and `data-state="open"`  
□ Content has `data-placement="end"`  
□ Footer changes from `Closed | end | Uncontrolled` to `Open | end | Uncontrolled`  
□ Logs include `opened`

Action

Click `Close Drawer`.

Verify

□ Drawer closes  
□ Focus returns to `Open Drawer`  
□ Logs include `closed by closeClick`

Action

Turn on `State > Controlled`, then turn on `Open`, then turn `Open` off.

Verify

□ Controlled `Open` opens and closes the Drawer  
□ Root Anatomy shows `Mode: controlled`  
□ Footer shows `Controlled`  
□ Logs track the open and close transitions

Action

Turn `Controlled` off. Turn `Default open` on.

Verify

□ Drawer opens immediately in uncontrolled mode  
□ Root Anatomy shows `Default open: true`  
□ Footer shows `Open | end | Uncontrolled`

Action

Turn `Disabled` on, turn `Default open` off, then click `Open Drawer`.

Verify

□ Drawer does not open  
□ Trigger Data includes `data-disabled`  
□ No new `opened` log is added for disabled interaction

Action

Turn `Disabled` off. Turn `Keep mounted` on. Click `Open Drawer`, then click `Close Drawer`.

Verify

□ Content remains mounted after close  
□ Content Data includes `data-state="closed"`  
□ Hidden wrapper exposes `hidden` and `aria-hidden="true"` around the closed content

Reset

Turn `Keep mounted` off. Turn `Default open` off. Ensure `Controlled` is off and Drawer is closed.

## Step 2: Root

Setup

Drawer closed. `Controlled` off. `Default open` off. `Disabled` off. `Keep mounted` off.

Action

Open Anatomy `Root`.

Verify

□ `Mode` is `uncontrolled`  
□ `Open` is `false` when Drawer is closed  
□ `Default open` is `false`  
□ `Disabled` is `false`  
□ `Keep mounted` is `false`  
□ `Escape closes` is `true`  
□ `Backdrop closes` is `true`

Reset

Ensure Drawer is closed.

## Step 3: Portal

Setup

Drawer closed. Popup `Disable Portal` off and `Custom Container` off.

Action

Click `Open Drawer`. Open Anatomy `Portal`.

Verify

□ `Content rendered` is `true`  
□ `Parent` is `body`  
□ `Inside canvas` is `false`  
□ `In custom target` is `false`  
□ `Disabled` is `false`  
□ `Custom container` is `false`  

Action

Close Drawer. Turn on `Popup > Custom Container`, then open Drawer.

Verify

□ `Parent` is `custom container`  
□ `Inside canvas` is `true`  
□ `In custom target` is `true`  
□ `Custom container` is `true`  
□ `Container rendered` is `true`  

Action

Close Drawer. Turn on `Popup > Disable Portal`, then open Drawer.

Verify

□ `Parent` is `inline`  
□ `Inside canvas` is `true`  
□ `In custom target` is `false`  
□ `Disabled` is `true`  

Reset

Turn `Disable Portal` off. Turn `Custom Container` off. Ensure Drawer is closed.

## Step 4: Trigger

Setup

Drawer closed. `Disabled` off. Composition `Trigger: Default`. Props off.

Action

Open Anatomy `Trigger`.

Verify

□ Attributes tag is `button`  
□ Attributes include `type="button"`  
□ Data includes `data-slot="drawer-trigger"`  
□ Data includes `data-state="closed"`  
□ Composition is `default`

Action

Click `Open Drawer`.

Verify

□ Trigger Data changes to `data-state="open"`  
□ Drawer opens  
□ Focus moves into Content

Action

Close Drawer. Focus Trigger and press Enter.

Verify

□ Drawer opens from Enter  
□ Logs include `opened`

Action

Close Drawer. Focus Trigger and press Space.

Verify

□ Drawer opens from Space  
□ Logs include `opened`

Action

Close Drawer. Set `Composition > Trigger Element: As Child`.

Verify

□ Trigger remains inspectable through `data-drawer-trigger`  
□ Trigger text remains `Open Drawer`  
□ Data still includes `data-slot="drawer-trigger"`  
□ Click opens Drawer

Action

Close Drawer. Set `Composition > Trigger Element: Render`.

Verify

□ Trigger renders as a `button`  
□ Trigger text remains `Open Drawer`  
□ Data still includes `data-slot="drawer-trigger"`  
□ Click opens Drawer

Action

Close Drawer. Turn on `Composition > Prevent Trigger Click`, then click `Open Drawer`.

Verify

□ Drawer stays closed  
□ Logs include `trigger event prevented`  
□ Source includes `onClick={(event) => event.preventDefault()}` on `Drawer.Trigger`

Action

Turn `Prevent Trigger Click` off.

Verify

□ Click opens Drawer again

Action

Close Drawer. Turn on `Props > Prop Check` and `Props > Trigger Slot`.

Verify

□ Trigger Data includes `data-prop-check="trigger"`  
□ Trigger Data includes `data-slot="drawer-trigger-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Trigger Slot` off. Set `Trigger Element` to `Default`. Ensure Drawer is closed.

## Step 5: Overlay

Setup

Drawer closed. `Backdrop closes` on. `Disable Overlay` off. Props off.

Action

Click `Open Drawer`. Open Anatomy `Overlay`.

Verify

□ Attributes tag is `div`  
□ ARIA includes `aria-hidden="true"`  
□ Data includes `data-slot="drawer-overlay"`  
□ Data includes `data-state="open"` after positioning  
□ Data includes `data-positioned`

Action

Click the overlay.

Verify

□ Drawer closes  
□ Logs include `closed by backdropClick`

Action

Open Drawer. Turn on `Dismiss > Disable Overlay`, then click the overlay.

Verify

□ Drawer stays open  
□ No `closed by backdropClick` log is added

Action

Turn on `Props > Prop Check` and `Props > Overlay Slot`.

Verify

□ Overlay Data includes `data-prop-check="overlay"`  
□ Overlay Data includes `data-slot="drawer-overlay-custom"`

Reset

Turn `Disable Overlay` off. Turn `Props > Prop Check` off. Turn `Props > Overlay Slot` off. Close Drawer.

## Step 6: Content

Setup

Drawer closed. Popup `Placement: End`. Content `Title Element: h2`. Props off.

Action

Click `Open Drawer`. Open Anatomy `Content`.

Verify

□ Attributes tag is `div`  
□ Attributes include `role="dialog"`  
□ ARIA name comes from `aria-label="Project drawer"` or the Title relationship  
□ Data includes `data-slot="drawer-content"`  
□ Data includes `data-state="open"`  
□ Data includes `data-placement="end"`  
□ Data includes `data-positioned` after positioning

Action

Set each `Popup > Placement` option: `Start`, `End`, `Top`, `Bottom`.

Verify

□ Content Data updates `data-placement` to the selected value  
□ Visual placement follows the selected class in the playground stage  
□ Drawer remains headless: placement is exposed as data and playground CSS provides the visual position

Action

Turn on `Props > Prop Check` and `Props > Content Slot`.

Verify

□ Content Data includes `data-prop-check="content"`  
□ Content Data includes `data-slot="drawer-content-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Content Slot` off. Set `Placement: End`. Close Drawer.

## Step 7: Title

Setup

Drawer open. Content `Title Element: h2`. Props off.

Action

Open Anatomy `Title`.

Verify

□ Attributes tag is `h2`  
□ Data includes `data-slot="drawer-title"`  
□ Text is `Project drawer`

Action

Set `Content > Title Element` to `h3`, then `h4`.

Verify

□ Attributes tag updates to the selected heading element  
□ Title remains connected to Content accessible naming

Action

Turn on `Props > Prop Check` and `Props > Title Slot`.

Verify

□ Title Data includes `data-prop-check="title"`  
□ Title Data includes `data-slot="drawer-title-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Title Slot` off. Set `Title Element: h2`.

## Step 8: Description

Setup

Drawer open. Props off.

Action

Open Anatomy `Description`.

Verify

□ Attributes tag is `p`  
□ Data includes `data-slot="drawer-description"`  
□ Description text is `Change a project setting, then close the drawer.`

Action

Turn on `Props > Prop Check` and `Props > Description Slot`.

Verify

□ Description Data includes `data-prop-check="description"`  
□ Description Data includes `data-slot="drawer-description-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Description Slot` off.

## Step 9: Close

Setup

Drawer open. Composition `Close: Default`. Props off.

Action

Open Anatomy `Close`.

Verify

□ Attributes tag is `button`  
□ Attributes include `type="button"`  
□ Data includes `data-slot="drawer-close"`  
□ Composition is `default`

Action

Click `Close Drawer`.

Verify

□ Drawer closes  
□ Focus returns to Trigger  
□ Logs include `closed by closeClick`

Action

Open Drawer. Set `Composition > Close Element: As Child`.

Verify

□ Close remains inspectable through `data-drawer-close`  
□ Close text remains `Close Drawer`  
□ Data still includes `data-slot="drawer-close"`  
□ Click closes Drawer

Action

Open Drawer. Set `Composition > Close Element: Render`.

Verify

□ Close renders as a `button`  
□ Close text remains `Close Drawer`  
□ Data still includes `data-slot="drawer-close"`  
□ Click closes Drawer

Action

Open Drawer. Turn on `Composition > Prevent Close Click`, then click `Close Drawer`.

Verify

□ Drawer stays open  
□ Logs include `close event prevented`  
□ Source includes `onClick={(event) => event.preventDefault()}` on `Drawer.Close`

Action

Turn `Prevent Close Click` off.

Verify

□ Click closes Drawer again

Action

Open Drawer. Turn on `Props > Prop Check` and `Props > Close Slot`.

Verify

□ Close Data includes `data-prop-check="close"`  
□ Close Data includes `data-slot="drawer-close-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Close Slot` off. Set `Close Element: Default`. Ensure Drawer is closed.

## Step 10: Source

Setup

Drawer closed. Default toolbar state.

Action

Open Canvas Source.

Verify

□ Source shows `Drawer.Root`  
□ Source shows `Drawer.Trigger`, `Drawer.Portal`, `Drawer.Overlay`, `Drawer.Content`, `Drawer.Title`, `Drawer.Description`, and `Drawer.Close`  
□ Source omits false/default props such as `disabled={false}` and inactive prop-check attributes

Action

Enable `Controlled`, `Keep mounted`, `Disable Portal`, `Custom Container`, `Placement: Start`, `Title Element: h3`, `Trigger Element: Render`, `Prevent Trigger Click`, `Close Element: As Child`, `Prevent Close Click`, `Props > Prop Check`, and all slot toggles.

Verify

□ Source reflects `open={open}`, `keepMounted`, `container={containerNode}`, `placement="start"`, `as="h3"`, render composition, `asChild`, prevent-click `onClick`, `data-prop-check`, and custom `data-slot` props  
□ Source does not include playground-only selectors, classes, refs, or `data-playground-inspect`

Reset

Return toolbar controls to default state.

## Step 11: Inspector / Logs

Setup

Drawer closed. Props off.

Action

Click `Open Drawer`, then click Trigger, Content, Title, Description, and Close before closing.

Verify

□ Selected Inspector updates for the clicked element  
□ Focused Inspector remains separate from Selected  
□ Inspector raw `Attributes`, `ARIA`, and `Data` match Anatomy formatting  
□ Logs include open and close events with compact timestamps  
□ `Clear` empties the Logs tab

## Step 12: Nested / Portal / Focus Behavior

Setup

Drawer open. `Escape closes` on. `Backdrop closes` on. `Disable Portal` off.

Action

Click `Open Nested`.

Verify

□ Nested content renders with `data-slot="drawer-content"`  
□ Nested content has `data-placement="bottom"`  
□ Focus moves into the nested drawer  
□ Logs include `nested opened`

Action

Press Escape.

Verify

□ Nested drawer closes first  
□ Parent drawer remains open  
□ Logs include `nested closed by escapeKeyDown`

Action

Press Escape again.

Verify

□ Parent drawer closes  
□ Focus returns to `Open Drawer`  
□ Logs include `closed by escapeKeyDown`

Action

Open Drawer. Turn `Escape closes` off, then press Escape.

Verify

□ Drawer remains open  
□ No `closed by escapeKeyDown` log is added

Action

Tab repeatedly inside the open Drawer, then Shift+Tab.

Verify

□ Focus remains contained inside the Drawer while open  
□ Focus cycles through `Focusable action`, `Open Nested`, and `Close Drawer`

Reset

Turn `Escape closes` on. Ensure Drawer is closed.

## Step 13: Workbook Cleanup / Rewrite Notes

Setup

Manual testing complete.

Action

Review Drawer workbook rows against verified behavior.

Verify

□ Rows for Root and Portal DOM identity are removed or rewritten because those parts do not render dedicated Atom DOM in this API  
□ Rows for refs are either backed by real browser evidence or moved out of playground coverage  
□ Rows for side, align, collision, arrow, and anchor geometry are removed or rewritten because Drawer only exposes `placement` metadata  
□ Rows for `mobile viewport/touch behavior` are either tested manually in a mobile viewport or clarified with specific expected behavior  
□ Rows verified by this protocol can be marked implemented/tested only after the tester completes all steps
