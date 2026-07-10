# Sidebar Manual Test Protocol

Run one step at a time in chat. Stop after each step until the tester confirms pass or reports an issue.

## Step 0: Playground Smoke Check

Setup

Default playground state. Workbook closed or left unchanged.

Action

1. Open the playground.
2. From the top menu, choose `Utilities` > `Sidebar`.
3. Open the `Anatomy`, `Canvas`, and `Inspector` workbench areas.
4. In Canvas, switch to `Source`, then switch back to `Canvas`.

Verify

□ Page title is `Sidebar`.
□ Workbench order is `Anatomy`, `Canvas`, then `Inspector`.
□ Canvas toolbar groups include `State`, `Layout`, `Composition`, and `Props`.
□ Canvas shows a sidebar panel and one `Toggle Sidebar` button.
□ Canvas footer shows `expanded | left | Collapses to offcanvas`.
□ Anatomy groups are in public order: `Root`, `Trigger`, `Panel`, `Main`.
□ Inspector tabs are `Selected`, `Focused`, and `Logs`.
□ Source starts with `<Sidebar.Root`.
□ Source includes `<Sidebar.Panel aria-label="Project navigation">Project navigation</Sidebar.Panel>`.
□ Source includes `<Sidebar.Trigger>Toggle Sidebar</Sidebar.Trigger>`.
□ `component-coverage.xlsx` is not updated.

## Step 1: Feature-Wide State

Setup

Default toolbar state: `Controlled` off, `Disabled` off, `Initial state` is `expanded`, `Collapsed state` is `offcanvas`, `Side` is `left`, `Controlled Value` is hidden, all composition controls set to `Default`, `Prop Check` off, and all custom slot controls off.

Check 1: uncontrolled toggle

Action

Click `Toggle Sidebar`.

Verify

□ Root, Trigger, Panel, and Main show `data-state="offcanvas"`.
□ Panel has `aria-hidden="true"` and `inert`.
□ Logs include `state offcanvas`.
□ Trigger raw ARIA shows `aria-expanded="false"`.

Reset

Click `Toggle Sidebar`.

Verify

□ Root, Trigger, Panel, and Main show `data-state="expanded"`.
□ Logs include `state expanded`.
□ Trigger raw ARIA shows `aria-expanded="true"`.

Check 2: rail collapsed state

Action

Set `State` > `Collapsed state` to `rail`.

Verify

□ Trigger Data shows `data-target-state="rail"`.
□ Root Data shows `data-collapsed-state="rail"`.

Action

Click `Toggle Sidebar`.

Verify

□ Root, Trigger, Panel, and Main show `data-state="rail"`.
□ Panel stays rendered without `aria-hidden` or `inert`.
□ Panel shows compact rail tokens for Overview, Settings, and Activity.

Reset

Click `Toggle Sidebar`; set `Collapsed state` back to `offcanvas`.

Check 3: controlled value appears only when controlled

Action

Confirm `Controlled` is off.

Verify

□ `Controlled Value` toolbar group is not shown.
□ `State` menu shows `Initial state`.

Action

Enable `Controlled`.

Verify

□ Separate `Controlled Value` toolbar group appears.
□ `State` menu no longer shows `Initial state`.

Action

In `Controlled Value`, set `State` to `rail`.

Verify

□ Root, Trigger, Panel, and Main show `data-state="rail"`.

Action

In `Controlled Value`, set `State` to `offcanvas`.

Verify

□ Root, Trigger, Panel, and Main show `data-state="offcanvas"`.
□ Panel has `aria-hidden="true"` and `inert`.

Reset

Set `State` to `expanded`; disable `Controlled`.

Check 4: uncontrolled initial state

Action

With `Controlled` off, set `State` > `Initial state` to `rail`.

Verify

□ Root, Trigger, Panel, and Main remount with `data-state="rail"`.
□ Root Data includes `data-collapsed-state="offcanvas"`.

Action

Set `Initial state` to `offcanvas`.

Verify

□ Root, Trigger, Panel, and Main remount with `data-state="offcanvas"`.
□ Panel has `aria-hidden="true"` and `inert`.

Reset

Set `Initial state` to `expanded`.

Check 5: side and disabled state

Action

Set `Layout` > `Side` to `right`.

Verify

□ Root, Trigger, Panel, and Main show `data-side="right"`.

Action

Enable `Disabled`.

Verify

□ Root Data includes `data-disabled`.
□ Trigger raw ARIA includes `aria-disabled="true"`.
□ Trigger Attributes include native `disabled`.

Action

Click `Toggle Sidebar`.

Verify

□ State does not change.

Reset

Disable `Disabled`; set `Side` to `left`.

## Step 2: Root

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Root`.

Check 1: default render

Action

Inspect Root in Anatomy.

Verify

□ Attributes title shows tag `div`.
□ Data includes `data-slot="sidebar"`.
□ Data includes `data-state="expanded"`.
□ Data includes `data-side="left"`.
□ Data includes `data-collapsed-state="offcanvas"`.
□ Data does not include `data-prop-check`.

Check 2: props and slot override

Action

Enable `Props` > `Prop Check` and `Props` > `Root Slot`.

Verify

□ Root Data includes `data-prop-check="root"`.
□ Root Data includes `data-slot="sidebar-custom"`.

Reset

Disable `Prop Check` and `Root Slot`.

Check 3: asChild composition

Action

Set `Composition` > `Root` to `As Child`.

Verify

□ Attributes title shows tag `section`.
□ Root keeps `data-state`, `data-side`, and `data-collapsed-state`.
□ Trigger, Panel, and Main still render inside the Root.

Reset

Set `Root` composition to `Default`.

Check 4: render composition

Action

Set `Composition` > `Root` to `Render`.

Verify

□ Attributes title shows tag `section`.
□ Root keeps `data-state`, `data-side`, and `data-collapsed-state`.
□ Trigger, Panel, and Main still render inside the Root.

Reset

Set `Root` composition to `Default`.

## Step 3: Trigger

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Trigger`.

Check 1: default render

Action

Inspect Trigger in Anatomy.

Verify

□ Attributes title shows tag `button`.
□ Attributes include `type="button"`.
□ Data includes `data-slot="sidebar-trigger"`.
□ Data includes `data-state="expanded"`.
□ Data includes `data-target-state="offcanvas"`.
□ Raw ARIA shows `aria-controls` matching Panel id.
□ Raw ARIA shows `aria-expanded="true"`.

Check 2: pointer interaction

Action

Click `Toggle Sidebar`.

Verify

□ Trigger Data includes `data-state="offcanvas"`.
□ Trigger Data includes `data-target-state="expanded"`.
□ Raw ARIA shows `aria-expanded="false"`.
□ Logs include `state offcanvas`.

Reset

Click `Toggle Sidebar`.

Check 3: keyboard interaction

Action

Focus `Toggle Sidebar`; press `Enter`.

Verify

□ Trigger Data includes `data-state="offcanvas"`.
□ Logs include `state offcanvas`.

Reset

Press `Enter`.

Action

Press `Space` on `Toggle Sidebar`.

Verify

□ Trigger Data includes `data-state="offcanvas"`.
□ Logs include `state offcanvas`.

Reset

Press `Space`.

Check 4: disabled behavior

Action

Enable `State` > `Disabled`.

Verify

□ Trigger Data includes `data-disabled`.
□ Raw ARIA shows `aria-disabled="true"`.
□ Attributes include native `disabled`.

Action

Click `Toggle Sidebar`.

Verify

□ Nothing changes because Trigger is disabled.
□ Trigger Data remains `data-state="expanded"`.
□ Logs do not add a new state change.

Reset

Disable `Disabled`.

Check 5: props and slot override

Action

Enable `Props` > `Prop Check` and `Props` > `Trigger Slot`.

Verify

□ Trigger Data includes `data-prop-check="trigger"`.
□ Trigger Data includes `data-slot="sidebar-trigger-custom"`.

Reset

Disable `Prop Check` and `Trigger Slot`.

Check 6: asChild composition

Action

Set `Composition` > `Trigger` to `As Child`.

Verify

□ Attributes title shows tag `span`.
□ Attributes include `role="button"`.
□ Trigger keeps state, target-state, and ARIA evidence.

Reset

Set `Trigger` composition to `Default`.

Check 7: render composition

Action

Set `Composition` > `Trigger` to `Render`.

Verify

□ Attributes title shows tag `button`.
□ Trigger keeps state, target-state, and ARIA evidence.

Reset

Set `Trigger` composition to `Default`.

## Step 4: Panel

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Panel`.

Check 1: default render

Action

Inspect Panel in Anatomy.

Verify

□ Attributes title shows tag `aside`.
□ Attributes include `aria-label="Project navigation"`.
□ Data includes `data-slot="sidebar-panel"`.
□ Data includes `data-state="expanded"`.
□ Data includes `data-side="left"`.
□ Data includes `data-collapsed-state="offcanvas"`.
□ Attributes do not include `aria-hidden`.
□ Attributes do not include `inert`.

Check 2: rail state

Action

Set `State` > `Collapsed state` to `rail`; click `Toggle Sidebar`.

Verify

□ Panel Data includes `data-state="rail"`.
□ Attributes do not include `aria-hidden`.
□ Attributes do not include `inert`.
□ Panel shows compact rail tokens for Overview, Settings, and Activity.
□ Panel rail token links remain tabbable and expose accessible names for Overview, Settings, and Activity.

Reset

Click `Toggle Sidebar`; set `Collapsed state` back to `offcanvas`.

Check 3: offcanvas state

Action

Click `Toggle Sidebar`.

Verify

□ Panel Data includes `data-state="offcanvas"`.
□ Attributes include `aria-hidden="true"`.
□ Raw Attributes include `inert`.

Reset

Click `Toggle Sidebar`; set `Collapsed state` back to `offcanvas`.

Check 4: props and slot override

Action

Enable `Props` > `Prop Check` and `Props` > `Panel Slot`.

Verify

□ Panel Data includes `data-prop-check="panel"`.
□ Panel Data includes `data-slot="sidebar-panel-custom"`.

Reset

Disable `Prop Check` and `Panel Slot`.

Check 5: asChild composition

Action

Set `Composition` > `Panel` to `As Child`.

Verify

□ Attributes title shows tag `nav`.
□ Panel keeps state, side, collapsed-state, and accessible-name evidence.

Reset

Set `Panel` composition to `Default`.

Check 6: render composition

Action

Set `Composition` > `Panel` to `Render`.

Verify

□ Attributes title shows tag `nav`.
□ Panel keeps state, side, collapsed-state, and accessible-name evidence.

Reset

Set `Panel` composition to `Default`.

## Step 5: Main

Setup

Default toolbar state. Canvas visible. Open Anatomy group `Main`.

Check 1: default render

Action

Inspect Main in Anatomy.

Verify

□ Attributes title shows tag `main`.
□ Data includes `data-slot="sidebar-main"`.
□ Data includes `data-state="expanded"`.
□ Data includes `data-side="left"`.
□ Data includes `data-collapsed-state="offcanvas"`.

Check 2: state mirrors Root

Action

Click `Toggle Sidebar`.

Verify

□ Main Data includes `data-state="offcanvas"`.

Reset

Click `Toggle Sidebar`.

Check 3: side mirrors Root

Action

Set `Layout` > `Side` to `right`.

Verify

□ Main Data includes `data-side="right"`.

Reset

Set `Side` to `left`.

Check 4: props and slot override

Action

Enable `Props` > `Prop Check` and `Props` > `Main Slot`.

Verify

□ Main Data includes `data-prop-check="main"`.
□ Main Data includes `data-slot="sidebar-main-custom"`.

Reset

Disable `Prop Check` and `Main Slot`.

Check 5: asChild composition

Action

Set `Composition` > `Main` to `As Child`.

Verify

□ Attributes title shows tag `section`.
□ Main keeps state, side, and collapsed-state evidence.
□ Trigger still renders inside Main.

Reset

Set `Main` composition to `Default`.

Check 6: render composition

Action

Set `Composition` > `Main` to `Render`.

Verify

□ Attributes title shows tag `section`.
□ Main keeps state, side, and collapsed-state evidence.
□ Trigger still renders inside Main.

Reset

Set `Main` composition to `Default`.

## Source

Setup

Default toolbar state. Canvas `Source` view visible.

Check 1: default source

Action

Inspect Source.

Verify

□ Source starts with `<Sidebar.Root`.
□ Source includes `<Sidebar.Panel aria-label="Project navigation">Project navigation</Sidebar.Panel>`.
□ Source includes `<Sidebar.Trigger>Toggle Sidebar</Sidebar.Trigger>`.
□ Source includes `onStateChange={setState}`.
□ Source omits `defaultState` while `Initial state` is `expanded`.
□ Source omits playground-only classes, inspection attributes, refs, and logs.

Check 2: uncontrolled defaultState source

Action

With `Controlled` off, set `State` > `Initial state` to `rail`.

Verify

□ Source includes `defaultState="rail"`.
□ Source does not include `state={state}`.

Action

Set `Initial state` to `offcanvas`.

Verify

□ Source includes `defaultState="offcanvas"`.
□ Source does not include `state={state}`.

Reset

Set `Initial state` to `expanded`.

Check 3: controlled state source

Action

Enable `Controlled`; set `Collapsed state` to `rail`; set `Side` to `right`; enable `Disabled`.

Verify

□ Source includes `state={state}`.
□ Source does not include `defaultState`.
□ Source includes `collapsedState="rail"`.
□ Source includes `side="right"`.
□ Source includes `disabled`.

Reset

Disable `Controlled`; set `Collapsed state` to `offcanvas`; set `Side` to `left`; disable `Disabled`.

Check 4: prop, slot, and composition source

Action

Enable `Props` > `Prop Check`; enable all custom slot controls.

Verify

□ Source includes `data-prop-check` for Root, Trigger, Panel, and Main.
□ Source includes custom `data-slot` values for Root, Trigger, Panel, and Main.

Action

Set each Composition control to `As Child`.

Verify

□ Source shows `asChild` for Root, Trigger, Panel, and Main.

Action

Set each Composition control to `Render`.

Verify

□ Source shows `render` usage for Root, Trigger, Panel, and Main.

Reset

Return all toolbar controls to default and switch back to Canvas.

## Inspector / Logs

Setup

Default toolbar state. Canvas visible. Inspector visible.

Check 1: selected evidence

Action

Click Root, Trigger, Panel, and Main in the Canvas one at a time.

Verify

□ `Selected` updates to the clicked public part.
□ Selected shows raw `Attributes`, `ARIA`, and `Data`.
□ Raw evidence filters playground-only `class`, `style`, duplicate `id`, and `data-playground-inspect`.

Check 2: focused evidence

Action

Focus `Toggle Sidebar`.

Verify

□ `Focused` updates to Trigger.
□ Focused shows raw `Attributes`, `ARIA`, and `Data`.

Check 3: logs

Action

Click `Toggle Sidebar`.

Verify

□ Logs show `state offcanvas`.

Action

Click `Toggle Sidebar`.

Verify

□ Logs show `state expanded`.

Reset

Clear logs if needed.

## Nested / Portal / Focus Behavior

Setup

Default toolbar state. Canvas visible.

Check 1: visible sidebar focus

Action

Focus `Toggle Sidebar`; press `Tab` repeatedly through the sidebar and main content.

Verify

□ In expanded state, Tab can move through visible sidebar links and main controls.

Check 2: rail focus

Action

Set `Collapsed state` to `rail`; click `Toggle Sidebar` to enter `rail`; press `Tab` repeatedly.

Verify

□ In rail state, focus can move through the compact Panel rail tokens.
□ Panel does not have `inert`.

Reset

Click `Toggle Sidebar`; set `Collapsed state` to `offcanvas`.

Check 3: offcanvas focus

Action

Set `Collapsed state` to `offcanvas`; click `Toggle Sidebar`; press `Tab` repeatedly.

Verify

□ Panel has `inert`.
□ Focus does not enter Panel links.

Reset

Click `Toggle Sidebar`; set `Collapsed state` to `offcanvas`.

Check 4: portal absence

Action

Inspect the DOM around the Canvas.

Verify

□ Sidebar does not create portal content.

## Workbook Cleanup / Rewrite Notes

Do not update `component-coverage.xlsx` during this task.

Classify after manual testing:

□ Playground implementation gaps: scenario, Source, Anatomy, Inspector, or Manual Test Protocol issues.
□ Package documentation gaps: Sidebar docs list Trigger `disabled`, but verified source exposes disabled through Root context rather than a Trigger prop.
□ Workbook coverage gaps: defer because this task explicitly skips workbook updates.
