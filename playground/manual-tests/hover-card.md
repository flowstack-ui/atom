# HoverCard Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

HoverCard scenario selected. Default toolbar state.

Action

Load the playground and open HoverCard from the top menu.

Verify

□ Scenario title shows `HoverCard`  
□ Anatomy panel renders `Root`, `Trigger`, `Portal`, `Content`, `Arrow` in that order  
□ Canvas renders the `Preview contributor` trigger  
□ Canvas toolbar shows `State`, `Popup`, `Composition`, `Props`  
□ Canvas Source tab opens and shows `HoverCard.Root` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Props off. Composition `Trigger: Default`. Popup `Portal: Body`, `Side: Bottom`, `Align: Center`, `Offset: 8`. State `Controlled` off, `Disabled` off, `Open delay: None`, `Close delay: Default`.

Action

Hover `Preview contributor`.

Verify

□ Trigger `data-state="open"`  
□ Content renders with `data-state="open"`  
□ Content has `aria-label="Contributor preview"`  
□ Footer changes from `Closed | Uncontrolled` to `Open | Uncontrolled`  
□ Logs include `trigger user mouseenter` and `opened`

Action

Move pointer away from trigger and content.

Verify

□ Trigger returns to `data-state="closed"` after the close delay  
□ Content is removed from the DOM after close  
□ Logs include `trigger user mouseleave` and `closed`

Action

Turn on `State > Controlled`, then click `Open controlled`, then `Close controlled`.

Verify

□ `Open controlled` opens Content and becomes disabled while open  
□ `Close controlled` closes Content and becomes disabled while closed  
□ Footer shows `Controlled`  
□ Logs include `opened by external control` and `closed by external control`

Action

Turn `Controlled` off. Turn `Default Open` on.

Verify

□ Content opens immediately in uncontrolled mode  
□ Root Anatomy shows `Default open: true`  
□ Footer shows `Open | Uncontrolled`

Action

Turn `Disabled` on, then hover and keyboard Tab to the trigger.

Verify

□ Trigger remains `data-state="closed"` or returns closed  
□ Content does not open from hover or keyboard focus-visible  
□ No new `opened` log is added for disabled interaction

Reset

Turn `Disabled` off. Turn `Default Open` off. Ensure `Controlled` is off.

## Step 2: Root

Setup

Content closed. `Controlled` off. `Default Open` off. `Disabled` off.

Action

Open Anatomy `Root`.

Verify

□ `Mode` is `uncontrolled`  
□ `Open` is `false` when Content is closed  
□ `Default open` is `false`  
□ `Disabled` is `false`  
□ `Open delay` matches the selected toolbar value  
□ `Close delay` matches the selected toolbar value

Action

Set `Open delay: Default`, hover the trigger, then wait for the card to open.

Verify

□ Root `Open delay` is `700`  
□ Content opens only after the configured delay  
□ Footer changes to `Open | Uncontrolled`

Action

Set `Close delay: Default`, move pointer away from trigger and content, then wait for close.

Verify

□ Root `Close delay` is `300`  
□ Content closes after the configured delay  
□ Footer changes to `Closed | Uncontrolled`

Action

Turn `Controlled` on. Click `Open controlled`.

Verify

□ Root `Mode` is `controlled`  
□ Root `Open` is `true`  
□ Footer shows `Open | Controlled`

Reset

Set `Controlled` off. Set `Open delay: None`. Set `Close delay: Default`. Ensure Content is closed.

## Step 3: Trigger

Setup

Content closed. `Controlled` off. `Disabled` off. `Trigger` composition `Default`. Props off.

Action

Open Anatomy `Trigger`.

Verify

□ Attributes tag is `span`  
□ Data includes `data-slot="hover-card-trigger"`  
□ Data includes `data-state="closed"`  
□ Composition `Mode` is `default`

Action

Hover the trigger.

Verify

□ Data changes to `data-state="open"`  
□ Content opens  
□ Logs include `trigger user mouseenter` and `opened`

Action

Move pointer away and wait for close.

Verify

□ Data returns to `data-state="closed"`  
□ Logs include `trigger user mouseleave` and `closed`

Action

Keyboard Tab to the trigger.

Verify

□ Focused Inspector shows tag `span`  
□ Focused Inspector Data includes `data-slot="hover-card-trigger"`  
□ Focused Inspector Data includes `data-state="open"`  
□ Content opens from keyboard focus-visible trigger interaction

Action

Set `Composition > Trigger: As Child`.

Verify

□ Attributes tag is `span`  
□ Trigger text remains `Preview contributor`  
□ Data still includes `data-slot="hover-card-trigger"`  
□ Data still includes current `data-state`

Action

Set `Composition > Trigger: Render`.

Verify

□ Attributes tag is `section`  
□ Trigger text remains `Preview contributor`  
□ Data still includes `data-slot="hover-card-trigger"`  
□ Hover and keyboard focus-visible behavior still open Content  
□ Content remains positioned relative to Trigger

Action

Turn on `Props > Prop Check` and `Props > Trigger Slot`.

Verify

□ Trigger Data includes `data-prop-check="trigger"`  
□ Trigger Data includes `data-slot="hover-card-trigger-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Trigger Slot` off. Set `Composition > Trigger: Default`. Ensure Content is closed.

## Step 4: Portal

Setup

Content closed. `Controlled` off. `Disabled` off. `Portal: Body`.

Action

Hover the trigger to open Content. Open Anatomy `Portal`.

Verify

□ `Content exists` is `true`  
□ `Mode` is `body`  
□ `Target exists` is `true`  
□ `Parent` is `body`  
□ `Inside canvas` is `false`  
□ `In custom target` is `false`

Action

Set `Popup > Portal: Container`, then hover the trigger to open Content.

Verify

□ `Mode` is `container`  
□ `Parent` is `div`  
□ `Inside canvas` is `true`  
□ `In custom target` is `true`  
□ Content remains positioned relative to Trigger

Action

Set `Popup > Portal: Disabled`, then hover the trigger to open Content.

Verify

□ `Mode` is `disabled`  
□ `Parent` is inside the live Root render path, not `body`  
□ `Inside canvas` is `true`  
□ `In custom target` is `false`  
□ Content still opens and closes from HoverCard interactions

Reset

Set `Popup > Portal: Body`. Ensure Content is closed.

## Step 5: Content

Setup

Content closed. `Portal: Body`. `Side: Bottom`. `Align: Center`. `Offset: 8`. `Use ariaLabel` on. Props off.

Action

Hover the trigger to open Content. Open Anatomy `Content`.

Verify

□ Attributes tag is `div`  
□ Data includes `data-slot="hover-card-content"`  
□ Data includes `data-state="open"`  
□ Data includes `data-side="bottom"` unless collision flips placement  
□ Data includes `data-positioned` after the first positioning frame  
□ ARIA includes `aria-label="Contributor preview"`  
□ Behavior `Side` is `bottom`  
□ Behavior `Align` is `center`  
□ Behavior `Offset` is `8`

Action

Set `Popup > Side: Top`, then open Content.

Verify

□ Behavior `Side` is `top`  
□ Data `data-side` is `top` unless collision flips placement  
□ Content is visually above the trigger when space allows

Action

Set `Popup > Align: Start`, then open Content.

Verify

□ Behavior `Align` is `start`  
□ Content edge aligns to the trigger start edge when space allows

Action

Set `Popup > Offset: 16`, then open Content.

Verify

□ Behavior `Offset` is `16`  
□ Content is farther from the trigger than at offset `8`

Action

Turn `Use ariaLabel` off.

Verify

□ ARIA no longer includes `aria-label="Contributor preview"`

Action

Turn on `Props > Prop Check` and `Props > Content Slot`.

Verify

□ Content Data includes `data-prop-check="content"`  
□ Content Data includes `data-slot="hover-card-content-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Content Slot` off. Turn `Use ariaLabel` on. Set `Side: Bottom`, `Align: Center`, `Offset: 8`. Ensure Content is closed.

## Step 6: Arrow

Setup

Content closed. `Portal: Body`. `Side: Bottom`. `Arrow Size: Default`. Props off.

Action

Hover the trigger to open Content. Open Anatomy `Arrow`.

Verify

□ Attributes tag is `svg`  
□ Attributes include `aria-hidden="true"`  
□ Data includes `data-slot="hover-card-arrow"`  
□ Data includes `data-side="bottom"` unless collision flips placement  
□ `Size` is `default`  
□ `width` is `10`  
□ `height` is `5`

Action

Set `Popup > Arrow Size: Wide`, then open Content.

Verify

□ `Size` is `wide`  
□ `width` is `18`  
□ `height` is `9`

Action

Set `Popup > Side: Left`, then open Content.

Verify

□ Arrow Data includes `data-side="left"` unless collision flips placement

Action

Turn on `Props > Prop Check` and `Props > Arrow Slot`.

Verify

□ Arrow Data includes `data-prop-check="arrow"`  
□ Arrow Data includes `data-slot="hover-card-arrow-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Arrow Slot` off. Set `Arrow Size: Default`. Set `Side: Bottom`. Ensure Content is closed.

## Step 7: Source

Setup

Default state: `Controlled` off, `Default Open` off, `Disabled` off, `Portal: Body`, `Side: Bottom`, `Align: Center`, `Offset: 8`, `Arrow Size: Default`, Props off.

Action

Open Canvas `Source`.

Verify

□ Source includes `<HoverCard.Root`  
□ Source includes `onOpenChange={setOpen}`  
□ Source includes `<HoverCard.Trigger>Preview contributor</HoverCard.Trigger>`  
□ Source includes `<HoverCard.Portal>`  
□ Source includes `<HoverCard.Content`  
□ Source includes `ariaLabel="Contributor preview"`  
□ Source includes `<HoverCard.Arrow />`  
□ Source does not include `openDelay={700}`  
□ Source does not include `closeDelay={300}`  
□ Source does not include `side="bottom"`  
□ Source does not include `align="center"`  
□ Source does not include `sideOffset={8}`  
□ Source does not include `data-playground-inspect`  
□ Source does not include playground classes

Action

Turn on `State > Default Open`.

Verify

□ Source includes `defaultOpen`

Action

Turn on `State > Controlled`.

Verify

□ Source includes `open={open}`  
□ Source no longer includes `defaultOpen`

Action

Set `Popup > Portal: Container`.

Verify

□ Source includes `<HoverCard.Portal container={portalContainer}>`

Action

Set `Popup > Portal: Disabled`.

Verify

□ Source includes `<HoverCard.Portal disabled>`

Action

Set `Composition > Trigger: As Child`.

Verify

□ Source includes `<HoverCard.Trigger asChild>`  
□ Source includes child `<span>Preview contributor</span>`

Action

Set `Composition > Trigger: Render`.

Verify

□ Source includes `render={(props) => <section {...props} />}`  
□ Source includes `Preview contributor`

Action

Turn on `Props > Prop Check`, `Trigger Slot`, `Content Slot`, and `Arrow Slot`. Set `Popup > Arrow Size: Wide`.

Verify

□ Source includes `data-prop-check="trigger"`  
□ Source includes `data-slot="hover-card-trigger-custom"`  
□ Source includes `data-prop-check="content"`  
□ Source includes `data-slot="hover-card-content-custom"`  
□ Source includes `data-prop-check="arrow"`  
□ Source includes `data-slot="hover-card-arrow-custom"`  
□ Source includes `width={18}`  
□ Source includes `height={9}`

Reset

Return to Canvas view. Turn Props off. Set `Portal: Body`, `Arrow Size: Default`, `Trigger: Default`, `Controlled` off, `Default Open` off. Ensure Content is closed.

## Step 8: Inspector / Logs

Setup

Canvas view open. Content closed. Props off. `Trigger: Default`.

Action

Click the trigger once.

Verify

□ Inspector `Selected` shows tag `span`  
□ Inspector `Selected` Data includes `data-slot="hover-card-trigger"`  
□ Inspector `Selected` Data includes current `data-state`  
□ Inspector `Focused` remains separate from `Selected`

Action

Keyboard Tab to the trigger.

Verify

□ Inspector `Focused` shows tag `span`  
□ Focused Data includes `data-slot="hover-card-trigger"`  
□ Focused Data includes `data-state="open"`  
□ Content opens from keyboard focus-visible behavior  
□ Logs include `trigger user focus` and `opened`

Action

Hover the trigger, then move pointer away.

Verify

□ Logs include `trigger user mouseenter`  
□ Logs include `opened`  
□ Logs include `trigger user mouseleave`  
□ Logs include `closed` after close delay  
□ Logs remain visible after Content closes  
□ Logs footer count matches the visible log rows

Action

Open Content, then click Content.

Verify

□ Inspector `Selected` shows tag `div`  
□ Selected Data includes `data-slot="hover-card-content"`  
□ Selected Data includes `data-state="open"`  
□ Selected ARIA includes `aria-label="Contributor preview"`

Action

Turn on `Props > Prop Check`, open Content, then click Trigger, Content, and Arrow.

Verify

□ Trigger Selected Data includes `data-prop-check="trigger"`  
□ Content Selected Data includes `data-prop-check="content"`  
□ Arrow Selected Data includes `data-prop-check="arrow"` when selected  
□ `Selected` and `Focused` evidence update independently

Reset

Click `Clear` in the Logs header. Turn Props off. Ensure Content is closed.

## Step 9: Nested / Portal / Focus Behavior

Setup

Content closed. `Portal: Body`. `Controlled` off. `Disabled` off. `Trigger: Default`.

Action

Keyboard Tab to the trigger.

Verify

□ Trigger receives keyboard focus  
□ Content opens from focus-visible trigger behavior  
□ Focus remains on Trigger  
□ Content does not take focus automatically  
□ Inspector `Focused` shows Trigger, not Content

Action

Press `Escape`.

Verify

□ Content closes  
□ Focus remains on or returns to Trigger  
□ Logs include `trigger user onKeyDown Escape` and `closed`

Action

Set `Portal: Container`, then hover the trigger.

Verify

□ Content opens inside the custom portal target  
□ Portal Anatomy shows `Mode: container`  
□ Content remains positioned relative to Trigger  
□ Inspector can still select and inspect Content

Action

Set `Portal: Disabled`, then hover the trigger.

Verify

□ Content opens inline inside the Canvas  
□ Portal Anatomy shows `Mode: disabled`  
□ Content remains positioned relative to Trigger  
□ Inspector can still select and inspect Content

Action

Turn `Disabled` on. Hover and keyboard Tab to the trigger.

Verify

□ Content does not open from hover  
□ Content does not open from keyboard focus  
□ Trigger remains inspectable  
□ Logs may show user focus or mouse events, but no new `opened` event is added for disabled behavior

Reset

Turn `Disabled` off. Set `Portal: Body`. Ensure Content is closed.

## Step 10: Workbook Cleanup / Rewrite Notes

This step is not manual testing.

Verify after workbook update

□ Public anatomy order is `Root`, `Trigger`, `Portal`, `Content`, `Arrow`  
□ `CardContent`, `CardPortal`, and `CardTrigger` rows are removed  
□ Root DOM identity/native prop/ref rows are removed because Root renders no DOM element  
□ Portal DOM identity/native prop/ref rows are removed because Portal is wrapper behavior  
□ Trigger click, Enter, and Space activation rows are removed because HoverCard opens from hover and focus-visible  
□ Focus rows say keyboard Tab focus-visible, not `Focus Canvas`  
□ Root rows keep `defaultOpen`, controlled `open`, `onOpenChange`, `openDelay=700`, `closeDelay=300`, and `disabled` state  
□ Portal rows keep body/container/disabled behavior verified through Anatomy and Inspector  
□ Content rows keep `ariaLabel`, `side`, `align`, `sideOffset`, `data-state`, `data-side`, and `data-positioned`  
□ Arrow rows keep `svg`, `aria-hidden`, `data-slot`, `data-side`, `width=10`, `height=5`, and wide override `width=18`, `height=9`  
□ Visual Arrow geometry rows are rewritten to DOM evidence or removed as not reliably playground-verifiable  
□ Props rows exist only for Trigger, Content, and Arrow  
□ Source rows cover controlled/default state, non-default delay props, portal props, trigger composition, prop/slot checks, and Arrow size override  
□ HoverCard Arrow docs match source defaults `width=10`, `height=5`
