# Tooltip Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Tooltip scenario selected. Default toolbar state.

Action

Load the playground and open Tooltip from the top menu.

Verify

□ Scenario title shows `Tooltip`  
□ Anatomy panel renders `Provider`, `Root`, `Trigger`, `Portal`, `Content`, `Arrow` in that order  
□ Canvas renders the `Save` trigger  
□ Canvas toolbar shows `State`, `Timing`, `Popup`, `Composition`, `Props`  
□ Canvas Source tab opens and shows `Tooltip.Provider` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

## Step 1: Feature-Wide State

Setup

Props off. Composition `Trigger: Default`, `Arrow: Default`. Popup `Portal: Body`, `Side: Top`, `Align: Center`, `Offset: 4`, `Arrow Size: Default`. State `Controlled` off, `Default Open` off, `Disabled` off, `Variant: Plain`.

Action

Hover `Save`.

Verify

□ Content renders with `role="tooltip"`  
□ Content has `data-state="open"`  
□ Trigger `aria-describedby` matches Content `id`  
□ Footer changes from `Closed | Uncontrolled` to `Open | Uncontrolled`  
□ Logs include `trigger user mouseenter` and `opened`

Action

Move pointer away from trigger and content.

Verify

□ Content is removed from the DOM after the close delay  
□ Trigger no longer has `aria-describedby`  
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

□ Content does not open from hover or keyboard focus-visible  
□ Trigger does not get `aria-describedby`  
□ No new `opened` log is added for disabled interaction

Reset

Turn `Disabled` off. Turn `Default Open` off. Ensure `Controlled` is off.

## Step 2: Provider

Setup

Content closed. Timing `Open delay: None`, `Close delay: None`, `Skip delay: Default`.

Action

Open Anatomy `Provider`.

Verify

□ `Open delay` is `0`  
□ `Close delay` is `0`  
□ `Skip delay` is `300`

Action

Set `Timing > Open delay: Default`, `Close delay: Long`, `Skip delay: Long`.

Verify

□ Provider `Open delay` is `400`  
□ Provider `Close delay` is `700`  
□ Provider `Skip delay` is `700`

Reset

Set `Timing > Open delay: Default`, `Close delay: Default`, `Skip delay: Default`.

## Step 3: Root

Setup

Content closed. `Controlled` off. `Default Open` off. `Disabled` off. `Variant: Plain`.

Action

Open Anatomy `Root`.

Verify

□ `Mode` is `uncontrolled`  
□ `Open` is `false` when Content is closed  
□ `Default open` is `false`  
□ `Disabled` is `false`  
□ `Variant` is `plain`  

Action

Turn `Controlled` on. Click `Open controlled`.

Verify

□ Root `Mode` is `controlled`  
□ Root `Open` is `true`  
□ Footer shows `Open | Controlled`

Reset

Set `Controlled` off. Ensure Content is closed.

## Step 4: Trigger

Setup

Content closed. `Controlled` off. `Disabled` off. `Trigger` composition `Default`. Props off.

Action

Open Anatomy `Trigger`.

Verify

□ Attributes tag is `span`  
□ Data includes `data-slot="tooltip-trigger"`  
□ `aria-describedby` is absent while closed  
□ Composition `Mode` is `default`

Action

Hover the trigger.

Verify

□ Trigger `aria-describedby` matches Content `id`  
□ Content opens  
□ Logs include `trigger user mouseenter` and `opened`

Action

Keyboard Tab to the trigger.

Verify

□ Focused Inspector shows tag `span`  
□ Focused Inspector Data includes `data-slot="tooltip-trigger"`  
□ Content opens from keyboard focus-visible trigger interaction

Action

Set `Composition > Trigger: As Child`.

Verify

□ Attributes tag is `span`  
□ Trigger text remains `Save`  
□ Data still includes `data-slot="tooltip-trigger"`  
□ Hover and keyboard focus-visible behavior still open Content

Action

Set `Composition > Trigger: Render`.

Verify

□ Attributes tag is `section`  
□ Trigger text remains `Save`  
□ Data still includes `data-slot="tooltip-trigger"`  
□ Content remains positioned relative to Trigger

Action

Turn on `Props > Prop Check` and `Props > Trigger Slot`.

Verify

□ Trigger Data includes `data-prop-check="trigger"`  
□ Trigger Data includes `data-slot="tooltip-trigger-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Trigger Slot` off. Set `Composition > Trigger: Default`. Ensure Content is closed.

## Step 5: Portal

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
□ `Parent` is not `body`  
□ `Inside canvas` is `true`  
□ `In custom target` is `false`

Reset

Set `Popup > Portal: Body`. Ensure Content is closed.

## Step 6: Content

Setup

Content closed. `Portal: Body`. Popup `Side: Top`, `Align: Center`, `Offset: 4`. `Use ariaLabel` on. Props off.

Action

Hover the trigger to open Content. Open Anatomy `Content`.

Verify

□ Attributes tag is `div`  
□ Attributes include `role="tooltip"`  
□ ARIA includes `aria-label="Save changes tooltip"`  
□ Data includes `data-slot="tooltip"`  
□ Data includes `data-state="open"`  
□ Data includes `data-side="top"`  
□ Data includes `data-variant="plain"`  
□ Data includes `data-positioned`

Action

Set `Popup > Side: Right`, `Align: Start`, `Offset: 16`.

Verify

□ Anatomy `Side` is `right`  
□ Anatomy `Align` is `start`  
□ Anatomy `Offset` is `16`  
□ Content Data `data-side` is `right` unless collision flips it to another valid side  
□ Content remains visually adjacent to Trigger

Action

Set `State > Variant: Rich`.

Verify

□ Content Data includes `data-variant="rich"`  
□ Content renders title text `Save changes`  
□ Content renders supporting copy beginning `Writes the current form state`  
□ Content uses the visibly wider rich layout

Action

Turn `Use ariaLabel` off.

Verify

□ Content ARIA no longer includes `aria-label`

Action

Turn on `Props > Prop Check` and `Props > Content Slot`.

Verify

□ Content Data includes `data-prop-check="content"`  
□ Content Data includes `data-slot="tooltip-content-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Content Slot` off. Turn `Use ariaLabel` on. Set `Variant: Plain`. Set `Side: Top`, `Align: Center`, `Offset: 4`. Ensure Content is closed.

## Step 7: Arrow

Setup

Content closed. `Arrow` composition `Default`. `Arrow Size: Default`. Props off.

Action

Hover the trigger to open Content. Open Anatomy `Arrow`.

Verify

□ Attributes tag is `svg`  
□ Attributes include `aria-hidden="true"`  
□ Attributes include `width="10"`  
□ Attributes include `height="5"`  
□ Data includes `data-slot="tooltip-arrow"`  
□ Data includes `data-side="top"` unless collision flips Content to another valid side

Action

Set `Popup > Arrow Size: Wide`.

Verify

□ Arrow `Size` is `wide`  
□ Attributes include `width="18"`  
□ Attributes include `height="9"` when side is `top` or `bottom`  
□ Width and height swap relationship is valid when side is `left` or `right`

Action

Set `Popup > Arrow Size: Default`. Set `Composition > Arrow: As Child`.

Verify

□ Attributes tag is `svg`  
□ Attributes include `width="10"`  
□ Attributes include `height="5"`  
□ Data still includes `data-slot="tooltip-arrow"`  
□ Data still includes current `data-side`  
□ Arrow remains visually attached to Content

Action

Set `Composition > Arrow: Render`.

Verify

□ Attributes tag is `svg`  
□ Data still includes `data-slot="tooltip-arrow"`  
□ Arrow remains visually attached to Content

Action

Turn on `Props > Prop Check` and `Props > Arrow Slot`.

Verify

□ Arrow Data includes `data-prop-check="arrow"`  
□ Arrow Data includes `data-slot="tooltip-arrow-custom"`

Reset

Turn `Props > Prop Check` off. Turn `Props > Arrow Slot` off. Set `Arrow Size: Default`. Set `Composition > Arrow: Default`. Ensure Content is closed.

## Step 8: Source

Setup

Default toolbar state. Source tab open.

Action

Toggle each toolbar group once: `Controlled`, `Default Open`, `Disabled`, `Variant: Rich`, provider timing, `Portal: Container`, `Side: Left`, `Align: End`, `Offset: 16`, `Arrow Size: Wide`, Trigger composition, Arrow composition, Prop Check, and each custom slot.

Verify

□ Source omits `Tooltip.Provider` timing props at documented defaults (`400`, `150`, `300`) and includes them only for non-default timing values  
□ Source updates to include controlled or default-open Root state  
□ Source updates to include Root disabled and variant props when enabled  
□ Source updates plain versus rich Content children when `Variant` changes  
□ Source updates to include `Tooltip.Portal container={portalContainer}` or `disabled`  
□ Source omits Content `side`, `align`, and `sideOffset` at documented defaults and includes them only for non-default values  
□ Source updates to include Content ariaLabel, custom slot, and prop-check props  
□ Source updates to include Trigger composition and custom props  
□ Source updates to include Arrow composition, width, height, custom slot, and prop-check props  
□ Source omits playground-only refs, classes, logs, and inspection attributes

Reset

Return toolbar controls to default state.

## Step 9: Inspector / Logs

Setup

Default toolbar state. Logs cleared. Inspector `Selected` tab open.

Action

Click Trigger, then hover Trigger, then open Inspector `Selected`, `Focused`, and `Logs`.

Verify

□ Selected Inspector shows the clicked Trigger element  
□ Selected Inspector raw groups include Attributes, ARIA, and Data  
□ Focused Inspector updates independently when keyboard focus moves  
□ Logs include compact timestamped rows for trigger user events and open state changes  
□ Clear removes all log rows and footer returns to `No Events`

## Step 10: Nested / Portal / Focus Behavior

Setup

Default toolbar state. Content closed.

Action

Keyboard Tab to Trigger, then press Escape.

Verify

□ Content opens from focus-visible trigger interaction  
□ Escape closes Content  
□ Focus remains on or returns to the Trigger relationship without moving to Content

Action

Hover Trigger, then move pointer over Content while `Variant: Plain`.

Verify

□ Content does not become an interactive hover surface  
□ Moving away closes Content after the configured close delay

Action

Set `Variant: Rich`, hover Trigger, then move pointer from Trigger to Content.

Verify

□ Content stays open while pointer is over Content  
□ Moving pointer away from Content closes it after the configured close delay

Reset

Set `Variant: Plain`. Ensure Content is closed.

## Step 11: Touch Session And Dismissal

Setup

Use a touch-capable browser or real phone on the Tooltip scenario. Default
Provider timing. `Controlled` off, `Disabled` off, `Variant: Plain`. Keep the
page vertically scrollable and Logs visible.

Action

Press and hold `Save` for less than 700 ms, then release.

Verify

□ Content never opens
□ Logs contain `touchstart` and `touchend` without `opened`
□ Touch-generated hover or focus does not open Content after release
□ Ordinary page scrolling and browser touch behavior remain available

Action

Press and hold `Save` without moving. Observe before and after 700 ms, continue
holding for longer than 1500 ms, then release.

Verify

□ Content is closed before 700 ms
□ Content opens once at approximately 700 ms without adding the 400 ms hover delay
□ Native text selection and the browser context callout do not replace the long press
□ Content remains open while the initiating finger stays down
□ The 1500 ms plain dismissal period starts only after release
□ Content closes once after that post-release period

Action

Set `Variant: Rich`. Repeat the valid stationary hold and release.

Verify

□ Rich opens once at the same 700 ms threshold
□ Rich remains open at 1500 ms after release
□ Rich closes after its finite 3000 ms post-release period
□ Rich Content contains only title/supporting text and no focusable controls

## Step 12: Touch Abandonment

Setup

Touch-capable browser or real phone. Content closed. Repeat each case from a
fresh touch.

Action

Before 700 ms, separately: move the touch more than approximately 10 CSS
pixels, drag vertically to scroll, add a second touch, trigger `touchcancel`
through available device/browser tooling, turn `Disabled` on, and navigate away
so Trigger unmounts.

Verify

□ No abandoned pending gesture opens Content later
□ Touch movement and vertical scroll are not default-prevented
□ Selection/callout suppression ends when active touch tracking ends
□ Scroll remains native and the page moves normally
□ Logs expose `touchmove` and `touchcancel` when those events occur
□ Repeated valid long presses still work after every cancellation case

Action

Open Content with a valid long press, then move more than approximately 10 CSS
pixels or begin scrolling before release.

Verify

□ The opened touch session closes immediately
□ No stale dismissal callback reopens or recloses it later
□ Mouse hover, hoverable Content, focus-visible, blur, and Escape still behave
as verified in the earlier desktop steps

## Workbook Cleanup / Rewrite Notes

□ Rows for Provider, Root, and Portal default tag, `data-slot`, native prop passthrough, and refs appear outdated because those public parts are context or portal wrappers with no Atom DOM element.  
□ Row for `data-trigger-mode` appears outdated for Tooltip; Tooltip Trigger does not expose that attribute.  
□ Rows for click, Enter, Space activation appear outdated for Tooltip; documented Tooltip behavior is hover, focus-visible, long press, and Escape dismissal.  
□ Rows for outside click/interact blocked/enabled appear outdated for Tooltip; package source only wires Escape through dismissable layer.  
□ Rows for nested overlays and focus restoration may need rewrite or removal unless a Tooltip-specific nested-layer scenario is approved.
