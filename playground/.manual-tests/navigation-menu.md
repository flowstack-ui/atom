# NavigationMenu Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

- Start the playground and open Navigation Menu from the top Navigation menu.
- Leave every NavigationMenu toolbar control at its initial value.

Action

- Open and close Anatomy groups, State, Behavior, Direction, Nesting, Composition, Props, Source, Selected, Focused, and Logs.

Verify

- The title is `Navigation Menu` and Canvas renders one closed horizontal row with Learn, Overview, and GitHub.
- The initial footer is `Open none | Uncontrolled | horizontal | ltr`.
- Default Anatomy order is Root, List: Primary, Item: Learn, Trigger: Learn, Content: Learn, Link: Atom UI, Item: Overview, Trigger: Overview, Content: Overview, Sub, Item: GitHub, Link: GitHub, Indicator, and Viewport.
- With Show Sub enabled, nested List, Foundations Item/Trigger/Content, Patterns Item/Trigger/Content, and nested Viewport appear immediately after Sub.
- Composition contains Root, List, Item, Trigger, Content, Link, Indicator, Viewport, and Sub; each submenu contains Default, As Child, and Render.
- Props contains one slot control for every public DOM part plus Prop Check.
- Every named panel and toolbar menu responds without moving the navigation menu out of the Canvas stage or showing an error overlay.

## Step 1: Feature-Wide State

### Controlled value

Setup

- Default toolbar state; State mode Uncontrolled; Root closed.

Action

- Enable Controlled and set Controlled value to Learn, Overview, then Closed.

Verify

- The matching panel opens for Learn and Overview; Closed removes the active panel.
- The footer reports `Open learn`, `Open overview`, then `Open none`.
- Logs remain unchanged because the toolbar changes the controlled prop externally rather than invoking the component callback.

### Uncontrolled default value

Setup

- Controlled off; Default value Closed.

Action

- Set Default value to Learn, Overview, then Closed.

Verify

- Each change remounts Root at the selected initial value.
- Source contains `defaultValue="learn"`, then `defaultValue="overview"`, and omits `defaultValue` for Closed.

### Hover timing

Setup

- Default value Closed; Instant Hover off.

Action

- Hover Learn, move to Overview after Learn opens, leave the component, then re-enter during the skip-delay window.

Verify

- First open waits approximately 200 ms; switching to Overview while open is immediate.
- Leaving closes after approximately 200 ms; re-entry within approximately 300 ms opens immediately.

Action

- Enable Instant Hover and repeat the initial hover and pointer leave.

Verify

- Opening and closing have no visible delay.
- Source contains `delayDuration={0}` and `skipDelayDuration={0}`.

Reset

- Restore Controlled off, Default value Closed, Instant Hover off, and Root closed.

## Step 2: Root

Setup

- Default toolbar state; Root expanded in Anatomy.

Action

- Inspect Root Attributes, ARIA, Data, and behavior rows.

Verify

- Attributes show tag `nav` and `dir="ltr"`; ARIA shows `aria-label="Main"`.
- Data shows `data-slot="navigation-menu"` and `data-orientation="horizontal"`.
- Rows show Mode `uncontrolled`, Value `none`, Direction mode `default`, Composition `default`, and Ref `nav`.

Action

- Enable Custom Label, then test Direction Provider RTL, Local LTR, and Local RTL.

Verify

- Custom Label renders `aria-label="Atom resources"`.
- Provider RTL, Local LTR, and Local RTL render exact `dir="rtl"`, `dir="ltr"`, and `dir="rtl"` respectively.
- Local LTR overrides the RTL provider; Local RTL uses no provider wrapper.

Action

- Test Root Default, As Child, and Render; then enable Prop Check and Root Slot.

Verify

- Default renders one `nav`; As Child and Render each render one `section` with Root behavior attributes and Ref intact.
- Data shows `data-prop-check="root"` and then `data-slot="navigation-menu-root-custom"` in every composition.
- The custom slot replaces the default value rather than adding a second `data-slot`.

Reset

- Restore Root composition, Direction Default, Custom Label off, Prop Check off, Root Slot off, and Root closed.

## Step 3: List

Setup

- Default toolbar state; List: Primary expanded.

Action

- Inspect the primary List, test Default, As Child, and Render, then enable Prop Check and List Slot.

Verify

- Default is `ul` with `role="list"`, `data-slot="navigation-menu-list"`, `data-orientation="horizontal"`, and Ref `ul`.
- As Child and Render each produce one `ol` containing the same three Items; role, orientation, keyboard behavior, and Ref remain intact.
- Data shows `data-prop-check="list"` and then `data-slot="navigation-menu-list-custom"` in every composition.

Action

- Set Orientation to Vertical.

Verify

- Data changes to `data-orientation="vertical"` and the navigation controls form a vertical stack.

Reset

- Restore List composition, Orientation Horizontal, Prop Check off, and List Slot off.

## Step 4: Item

### Learn — baseline Item contract

Setup

- Default toolbar state; Item: Learn expanded.

Action

- Inspect Learn, test Item Default, As Child, and Render, then enable Prop Check and Item Slot.

Verify

- Learn is one `li` with default `data-slot="navigation-menu-item"` and Ref `li` in every composition.
- Learn continues to scope its Trigger and Content in every composition.
- Data shows `data-prop-check="item"` and then `data-slot="navigation-menu-item-custom"`.

### Overview and GitHub — structure deltas

Setup

- Restore Item composition and Props controls.

Action

- Inspect Item: Overview and Item: GitHub.

Verify

- Both are `li` with `data-slot="navigation-menu-item"`.
- Overview scopes a Trigger/Content pair; GitHub contains a direct Link.
- The representative Learn prop marker and custom slot do not leak to either Item.

## Step 5: Trigger

### Learn — baseline Trigger contract

Setup

- Default toolbar state; Root closed; Trigger: Learn expanded.

Action

- Inspect Learn, then click it and activate it with Enter and Space.

Verify

- Learn is `button` with `type="button"`, `data-slot="navigation-menu-trigger"`, `data-state="closed"`, and Ref `button`.
- Closed ARIA shows `aria-expanded="false"`; `aria-controls` references the Learn Content id.
- Each activation path opens and closes Learn; open state shows `aria-expanded="true"` and `data-state="open"`.

Action

- Test Trigger Default, As Child, and Render, then enable Prop Check and Trigger Slot.

Verify

- Every composition renders exactly one `button` with type, ARIA relationship, state, behavior, and Ref intact.
- Data shows `data-prop-check="trigger"` and then `data-slot="navigation-menu-trigger-custom"` in every composition.

Action

- Enable Block Trigger Event and click Learn.

Verify

- Learn remains closed because the consumer click handler prevents default.

### Overview — disabled delta

Setup

- Restore Trigger composition and Props controls; Block Trigger Event off; Root closed.

Action

- Enable Disable Trigger, inspect Overview, then click it and press Enter or Space.

Verify

- Attributes show `disabled`; ARIA shows `aria-disabled="true"`; Data shows `data-disabled`.
- Pointer and keyboard activation do not open Overview.

Reset

- Restore Disable Trigger off and Root closed.

## Step 6: Content

### Learn — registration, emission, and composition

Setup

- Default toolbar state; Root closed; Content: Learn expanded.

Action

- Inspect Learn while closed, then open Learn.

Verify

- Content is inactive while closed and emitted through Viewport only when Learn opens.
- Emitted Content is `div` with `tabindex="-1"`, `data-slot="navigation-menu-content"`, `data-state="open"`, and `data-motion="from-end"`.
- Its id matches Learn Trigger `aria-controls`.

Action

- Open Overview, then return to Learn.

Verify

- Only the active Content is emitted.
- Forward movement uses `data-motion="from-end"`; backward movement uses `data-motion="from-start"`.

Action

- Test Content Default, As Child, and Render, reopening Learn after each change; then enable Prop Check and Content Slot.

Verify

- Default emits one `div`; As Child and Render each emit one `section` with id, tabindex, state, motion, content, and focus behavior intact.
- Data shows `data-prop-check="content"` and then `data-slot="navigation-menu-content-custom"` in every composition.
- The custom slot and composition survive declaration-site registration and Viewport emission.

Reset

- Restore Content composition, Prop Check off, Content Slot off, and Root closed.

## Step 7: Link

### GitHub — direct Link and active delta

Setup

- Default toolbar state; Link: GitHub expanded.

Action

- Inspect GitHub, then enable Active Link.

Verify

- GitHub is `a` with `href="#github"` and `data-slot="navigation-menu-link"`.
- Active state adds `aria-current="page"` and `data-active`.

### Atom UI — composition, props, and selection

Setup

- Active Link off; open Learn; Link: Atom UI expanded.

Action

- Inspect Atom UI, test Link Default, As Child, and Render, then enable Prop Check and Link Slot.

Verify

- Every composition renders exactly one `a` with `href="#atom-primitives"`, Link behavior, and Ref `a` intact.
- Data shows `data-prop-check="link"` and then `data-slot="navigation-menu-link-custom"` in every composition.
- Other Links retain `data-slot="navigation-menu-link"`.

Action

- Select Atom UI.

Verify

- Logs add `selected link atom` and the active Root panel closes.

Reset

- Restore Link composition, Prop Check off, Link Slot off, and Root closed.

## Step 8: Indicator

Setup

- Default toolbar state; Root closed; Show Indicator off.

Action

- Enable Show Indicator, then Force Indicator and inspect Indicator.

Verify

- Indicator is absent while closed until Force Indicator is enabled.
- Forced Indicator is `div` with `aria-hidden="true"`, `data-slot="navigation-menu-indicator"`, `data-state="hidden"`, `data-orientation="horizontal"`, and Ref `div`.

Action

- Open Learn, then Overview.

Verify

- Data changes to `data-state="visible"`.
- Style exposes `--atom-navigation-menu-trigger-left`, `--atom-navigation-menu-trigger-top`, `--atom-navigation-menu-trigger-width`, `--atom-navigation-menu-trigger-height`, `--atom-navigation-menu-trigger-center-x`, and `--atom-navigation-menu-trigger-center-y`.
- The visual indicator moves from Learn to Overview.

Action

- Test Indicator Default, As Child, and Render, then enable Prop Check and Indicator Slot.

Verify

- Default renders one `div`; As Child and Render each render one `span` with visibility, geometry, movement, ARIA, and Ref intact.
- Data shows `data-prop-check="indicator"` and then `data-slot="navigation-menu-indicator-custom"` in every composition.

Reset

- Restore Indicator composition, Prop Check off, Indicator Slot off, Force Indicator off, Show Indicator off, and Root closed.

## Step 9: Viewport

Setup

- Default toolbar state; Root closed; Force Viewport off; Viewport expanded.

Action

- Inspect Viewport while closed, then enable Force Viewport.

Verify

- Viewport is inactive while closed until Force Viewport is enabled.
- Forced Viewport is `div` with `data-slot="navigation-menu-viewport"`, `data-state="closed"`, `data-orientation="horizontal"`, no Content child, and Ref `div`.

Action

- Open Learn, then Overview; move the pointer from Trigger into Viewport and then outside.

Verify

- Data changes to `data-state="open"`.
- Style exposes non-zero `--atom-navigation-menu-viewport-width` and `--atom-navigation-menu-viewport-height` values that adapt to the active Content.
- Entering Viewport keeps the panel open; leaving restarts delayed close.

Action

- Test Viewport Default, As Child, and Render, then enable Prop Check and Viewport Slot.

Verify

- Default renders one `div`; As Child and Render each render one `section` with active Content, state, orientation, sizing, pointer behavior, and Ref intact.
- Data shows `data-prop-check="viewport"` and then `data-slot="navigation-menu-viewport-custom"` in every composition.

Reset

- Restore Viewport composition, Prop Check off, Viewport Slot off, Force Viewport off, and Root closed.

## Step 10: Sub

### Sub — state and composition

Setup

- Default toolbar state; Show Sub off; Root closed.

Action

- Enable Show Sub, open Overview, and inspect Sub.

Verify

- Sub is `div` with `dir="ltr"`, `data-slot="navigation-menu-sub"`, `data-orientation="horizontal"`, and Ref `div`.
- Rows show Mode `uncontrolled`, Value `foundations`, and Composition `default`.
- Nested Anatomy adds List, two Items, two Triggers, two Contents, and Viewport; Foundations is initially open.
- Nested List is `ul`; Items are `li`; Triggers are `button`; active Content and Viewport are `div`.
- Nested parts expose their matching default `navigation-menu-*` slots.

Action

- Set Sub default to Patterns, Closed, then Foundations.

Verify

- Each value remounts the uncontrolled Sub at that initial state; Closed removes the nested Viewport.

Action

- Enable Controlled Sub and set its value to Patterns, Foundations, then Closed.

Verify

- Nested Content follows the external value and Logs contain each nested open and close callback once.

Action

- Restore Controlled Sub off and Foundations; test Sub Default, As Child, and Render; then enable Prop Check and Sub Slot.

Verify

- Default renders one `div`; As Child and Render each render one `section` with direction, orientation, nested scope, state, keyboard behavior, and Ref intact.
- Data shows `data-prop-check="sub"` and then `data-slot="navigation-menu-sub-custom"` in every composition.
- Nested parts retain their default slots.

Reset

- Restore Sub composition, Prop Check off, Sub Slot off, Controlled Sub off, default Foundations, Show Sub off, and Root closed.

## Step 11: Keyboard, Direction, and Focus

### Horizontal trigger navigation

Setup

- Default toolbar state; Root closed; focus Learn.

Action

- Press ArrowRight, ArrowLeft, End, and Home one at a time.

Verify

- ArrowRight moves Learn to Overview; ArrowLeft moves Overview to Learn.
- End and Home focus the last and first enabled Trigger; Focused follows the active Trigger.

Action

- Enable Disable Trigger and repeat ArrowRight and End from Learn.

Verify

- Disabled Overview is skipped and focus remains on Learn.

### Open-panel handoff and direction

Setup

- Disable Trigger off; open Learn.

Action

- Press ArrowRight, then test Provider RTL, Local LTR, and Local RTL with ArrowRight and ArrowLeft.

Verify

- LTR moves focus and the open panel from Learn to Overview.
- Provider RTL and Local RTL mirror horizontal movement; Local LTR overrides the RTL provider.
- Raw Root `dir` remains exact for each direction mode.

### Content entry and Escape

Setup

- Direction Default; Root closed; focus Learn.

Action

- Press ArrowDown; close; then press ArrowUp.

Verify

- ArrowDown opens Learn and focuses the first focusable Content element.
- ArrowUp opens Learn and focuses the last focusable Content element.

Action

- Press Escape while Learn is open.

Verify

- Root closes, focus returns to Learn, and Logs add `closed navigation menu`.

### Vertical orientation

Setup

- Root closed; Orientation Vertical; focus Learn.

Action

- Press ArrowRight and ArrowLeft, then Enter, Space, ArrowDown, ArrowUp, and Escape.

Verify

- Horizontal roving keys do not move Trigger focus in vertical orientation.
- Activation, Content entry, and Escape retain their documented behavior.

Reset

- Restore Orientation Horizontal, Direction Default, Disable Trigger off, and Root closed.

## Step 12: Source

Setup

- Restore every toolbar control to its initial value and open Source.

Action

- Read default Source.

Verify

- Source shows Root, List, three Items, two Trigger/Content pairs, the direct GitHub Link, and Viewport.
- It omits controlled/default values, timing, direction, Indicator, Sub, composition escapes, prop checks, and custom slots.
- It contains no playground classes, refs, selectors, inspection markers, log plumbing, or layout-only wrappers.

Action

- Enable Controlled Learn, Vertical, Local RTL, Custom Label, forced Indicator and Viewport, Controlled Sub Patterns, one non-default composition per public part, Block Trigger Event, all slot overrides, and Prop Check.

Verify

- Source shows every active public option exactly once and every representative custom `data-slot` exactly once.
- Controlled Root and Sub props and callbacks appear only in Controlled mode; provider wrapping appears only for Provider RTL and Local LTR.
- Each composition is represented by matching `asChild` or `render` consumer JSX; Content composition appears at its declaration site.
- Non-representative and nested parts retain default props and slots.

Reset

- Restore every toolbar control to its initial value.

## Step 13: Inspector / Logs

Setup

- Default toolbar state; Root closed; clear Logs.

Action

- Click Root, open Learn, click Atom UI, then inspect Selected and Focused.

Verify

- Selected tracks the last clicked DOM part; Focused independently tracks the active element.
- Both use the same Attributes, ARIA, and Data syntax as Anatomy.
- Root evidence includes `nav`, `aria-label="Main"`, `dir="ltr"`, `data-slot="navigation-menu"`, and `data-orientation="horizontal"`.
- Trigger evidence includes `button`, `type="button"`, `aria-expanded`, `aria-controls`, `data-slot`, and `data-state`.
- Link evidence includes `a`, `href`, and `data-slot="navigation-menu-link"`.

Action

- Open Logs, then Clear.

Verify

- Logs contain only real value-change and Link-selection callbacks with compact timestamps.
- Each callback appears once; Clear empties the list and adds no fake event.

## Step 14: Nested Escape and Focus Order

Setup

- Default toolbar state; Show Sub on; Sub default Foundations; Root closed.

Action

- Open Overview, focus Foundations, and press Escape twice.

Verify

- First Escape closes the nested Sub while Overview remains open.
- Second Escape closes Overview and restores focus to Overview Trigger.
- Logs preserve nested-close before root-close order.

Action

- Reopen Overview, switch the nested value with keyboard, then move focus through Root Triggers.

Verify

- Nested Trigger focus and value remain inside Sub scope; Root roving focus remains independent.
- Closing either scope does not leave focus on unmounted Content.

Reset

- Restore Show Sub off and Root closed.

## Workbook Cleanup / Rewrite Notes

- Replaced the generic 198-row sheet with 111 NavigationMenu-specific, playground-verifiable rows.
- Removed nonexistent menu anatomy, checkbox/radio items, typeahead, portals, outside-dismiss configuration, and generic selection rows.
- Corrected provider-direction coverage and public anatomy ownership.
- Added exact default/custom slot coverage and Default/As Child/Render coverage for every DOM part, including Content registration through Viewport.
- Keep every row `Tested = no` and `Coverage Status = untested` until Steps 0–14 pass.
