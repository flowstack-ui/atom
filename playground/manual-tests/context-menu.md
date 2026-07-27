# Context Menu Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Context Menu scenario selected. Default toolbar state.

Action

Load the playground and open Context Menu from the top menu.

Verify

□ Scenario title shows `Context Menu`  
□ Anatomy panel starts in source order with `Root`, `Trigger: Project canvas`, `Content: Menu`, `Group: Primary actions`, `Item: New project`  
□ Anatomy repeats part names with labels for repeated parts, including `Sub Trigger: More actions`, `Sub Content: More actions`, `Sub Trigger: Share actions`, and `Sub Content: Share actions`  
□ Canvas renders the `Project canvas` context-menu target and controlled `Open Menu` / `Close Menu` buttons  
□ Canvas toolbar shows `State`, `Popup`, `Items`, `Submenu`, `Composition`, `Props`  
□ Canvas Source tab opens and shows `ContextMenu.Root` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors  
□ No changes are made to `component-coverage.xlsx`

## Step 1: Feature-Wide State

Setup

Canvas visible. Props off. Controlled off. Menu closed. Direction `ltr`. `Modal`, `Close on select`, `Escape closes`, and `Loop` on.

Action

Turn `State > Controlled` on. Click `Open Menu`, then `Close Menu`.

Verify

□ Content opens from the controlled action and then closes  
□ Footer changes between closed and open state  
□ Logs include `opened` and `closed`

Action

Turn `State > Controlled` off. Turn `Default open` on, then off.

Verify

□ Uncontrolled `defaultOpen` opens Content immediately  
□ Disabling `Default open` returns the scenario to a closed uncontrolled state

Action

Open the menu with right-click, select `New project`, then repeat with `Close on select` off.

Verify

□ With `Close on select` on, selecting an action closes Content  
□ With `Close on select` off, selecting an action keeps Content open

Action

Open the menu. Toggle `Escape closes` off, press `Escape`, then toggle it on and press `Escape`.

Verify

□ With `Escape closes` off, Content remains open  
□ With `Escape closes` on, Content closes

Reset

Turn `Controlled` off. Turn `Modal`, `Close on select`, `Escape closes`, and `Loop` on. Ensure menu is closed.

## Step 2: Root

Setup

Default toolbar state. Menu closed.

Action

Open Anatomy `Root`.

Verify

□ `Mode` is `uncontrolled`  
□ `Default open` is `no`  
□ `Open` is `no`  
□ `Modal` is `yes`  
□ `Close on select` is `yes`  
□ `Escape closes` is `yes`  
□ `Loop` is `yes`  
□ `Direction` is `ltr`  
□ Root has no raw DOM Attributes, ARIA, or Data groups

## Step 3: Trigger

Setup

Default toolbar state. Menu closed. Props off. Trigger composition `Default`.

Action

Open Anatomy `Trigger`.

Verify

□ Attributes tag is `span`  
□ Data includes `data-slot="context-menu-trigger"`  
□ Data includes `data-state="closed"`  
□ Data does not include `data-prop-check`  
□ `aria-expanded` is absent or `false` while closed

Action

Right-click `Project canvas`.

Verify

□ Content opens at the pointer location  
□ Trigger Data includes `data-state="open"`  
□ `aria-controls` matches Content `id` when Content is mounted  
□ Logs include `trigger user onContextMenu` and `opened`

Action

Close the menu. Focus the target and press `Shift+F10`, then close and press the Context Menu key.

Verify

□ Both keyboard paths open Content  
□ Keyboard opens move real focus to the first item
□ Logs identify the keyboard trigger path

Action

On touch or pen, hold the target for at least 700 ms. Repeat while releasing early, moving more than 10 px, scrolling, cancelling the pointer, and adding a second contact.

Verify

□ A completed long press opens exactly once at the contact point
□ `data-pressed` exists only while the hold is pending
□ Every abandoned hold remains closed and restores text-selection/callout behavior
□ A native context-menu event does not create a second open event
□ The visible controlled `Open Menu` action remains available as the discoverable alternative

Action

Turn `Composition > Disabled trigger` on and right-click the target.

Verify

□ Trigger Data includes `data-disabled`  
□ Content does not open

Reset

Turn `Disabled trigger` off. Ensure menu is closed.

## Step 4: Content

Setup

Default toolbar state. Menu open.

Action

Open Anatomy `Content`.

Verify

□ Attributes tag is `div`  
□ ARIA includes `role="menu"`  
□ ARIA includes `aria-orientation="vertical"`  
□ Attributes include `tabindex="-1"`  
□ Data includes `data-slot="menu-content"`  
□ Data includes `data-state="open"`  
□ Data includes `data-side`, `data-align`, and `data-positioned`  
□ Parent is `body`

Action

Inspect Anatomy `Arrow`, `Label`, and `Item Indicator` while their owners are mounted.

Verify

□ Arrow reports the resolved `data-side` and `data-align`
□ Group references the nested Label id through `aria-labelledby`
□ Item Indicator reports the owning checkbox/radio checked state

Action

Change `Popup > Side`, `Align`, `Large offset`, `Content ariaLabel`, and `Content loop off`.

Verify

□ `data-side` and `data-align` update to the final placement  
□ Side offset row changes from `4` to `16`  
□ `aria-label="Project actions"` appears when enabled  
□ Content loop row changes to `off`

Action

Inspect Content and Sub Content style evidence after changing placement and opening the submenu.

Verify

□ Content and Sub Content expose `--atom-menu-available-width` and `--atom-menu-available-height`
□ Content and Sub Content expose `--atom-menu-trigger-width` and `--atom-menu-trigger-height`
□ Content and Sub Content expose `--atom-menu-transform-origin`

## Step 5: Group / Item / Separator

Setup

Default toolbar state. Menu open. Props off. Item composition `Default`.

Action

Open Anatomy `Group`, `Item`, and `Separator`.

Verify

□ Group ARIA includes `role="group"` and Data includes `data-slot="menu-group"`  
□ Primary Item ARIA includes `role="menuitem"`  
□ Primary Item Data includes `data-slot="menu-item"` and `data-value="new"`  
□ Separator ARIA includes `role="separator"` and `aria-orientation="horizontal"`  
□ Separator Data includes `data-slot="menu-separator"`  
□ Props off means none of these raw Data groups include `data-prop-check`

Action

Turn `Items > Show disabled item` on, then use Arrow navigation.

Verify

□ Disabled item appears with disabled state evidence  
□ Keyboard focus moves onto the disabled item
□ Enter, Space, and click cannot activate the disabled item

Action

Set Item composition to `As Child`, then `Render`.

Verify

□ Item text remains `New project`  
□ Item Data still includes `data-slot="menu-item"`  
□ Render mode uses the custom rendered element

Reset

Set Item composition to `Default`. Turn `Show disabled item` off.

## Step 6: Checkbox Item

Setup

Default toolbar state. Menu open. `Checkbox checked` off. `Checkbox closes` off.

Action

Open Anatomy `Checkbox Item`.

Verify

□ ARIA includes `role="menuitemcheckbox"`  
□ `aria-checked="false"`  
□ Data includes `data-slot="menu-checkbox-item"`  
□ Data does not include `data-checked`

Action

Click `Show grid`.

Verify

□ `aria-checked` changes to `true`  
□ `data-checked` appears  
□ Menu remains open while `Checkbox closes` is off  
□ Logs include checkbox change evidence

Action

Turn `Checkbox disabled` on and navigate with Arrow keys.

Verify

□ Checkbox item exposes disabled state  
□ Keyboard focus moves onto the disabled checkbox item
□ Enter, Space, and click cannot toggle the disabled checkbox item

Reset

Turn `Checkbox checked` off. Turn `Checkbox disabled` off.

## Step 7: Radio Group / Radio Item

Setup

Default toolbar state. Menu open. `Radio closes` off.

Action

Open Anatomy `Radio Group` and `Radio Item`.

Verify

□ Radio Group ARIA includes `role="group"`  
□ Radio Group Data includes `data-slot="menu-radio-group"`  
□ Selected Radio Item ARIA includes `role="menuitemradio"`  
□ Selected Radio Item includes `aria-checked="true"`  
□ Selected Radio Item Data includes `data-slot="menu-radio-item"` and `data-checked`

Action

Use toolbar `Radio value` and `Radio value 2` controls.

Verify

□ Checked item changes in each group  
□ Group values update independently

Action

Turn `Compact radio disabled` on and navigate with Arrow keys.

Verify

□ Disabled compact radio item receives focus but cannot change selection

Reset

Turn `Compact radio disabled` off.

## Step 8: Sub / Sub Trigger / Sub Content

Setup

Default toolbar state. Menu open. `Show submenu` on. `Nested submenu` off.

Action

Open Anatomy `Sub`, `Sub Trigger`, and `Sub Content`.

Verify

□ Sub shows uncontrolled state  
□ Sub Trigger ARIA includes `aria-haspopup="menu"`  
□ Sub Trigger `aria-expanded` and `data-state` reflect closed state  
□ Sub Content is not rendered until opened

Action

Hover or ArrowRight on `More actions`.

Verify

□ Sub Content opens with `role="menu"`  
□ Sub Content Data includes `data-slot="menu-sub-content"`  
□ Sub Content Data includes `data-positioned` and `data-side`  
□ Sub item exists and can be selected

Action

Touch or use a pen on `More actions` without completing a tap, then cancel or scroll; repeat with a completed tap.

Verify

□ Touch or pen contact alone does not start the mouse-hover submenu timer
□ Cancellation or scroll leaves Sub Content closed
□ A completed tap remains able to open the submenu

Action

Turn `Controlled submenu` on and use `Open Submenu` / `Close Submenu`.

Verify

□ Controlled submenu actions open and close Sub Content  
□ Logs include controlled submenu open/close evidence

Action

Turn `Direction` to `rtl`.

Verify

□ RTL submenu keyboard behavior mirrors: ArrowLeft opens and ArrowRight closes

Reset

Turn `Direction` to `ltr`. Turn `Controlled submenu` off. Ensure menu is closed.

## Step 9: Props / Slots

Setup

Default toolbar state. Menu open. Props off.

Action

Turn `Props > Prop Check` on.

Verify

□ Trigger Data includes `data-prop-check="trigger"`  
□ Content Data includes `data-prop-check="content"`  
□ Group Data includes `data-prop-check="group"`  
□ Item Data includes `data-prop-check="item"`  
□ Checkbox Item Data includes `data-prop-check="checkbox-item"`  
□ Radio Group Data includes `data-prop-check="radio-group"`  
□ Radio Item Data includes `data-prop-check="radio-item"`  
□ Separator Data includes `data-prop-check="separator"`  
□ Opened submenu parts show matching sub part `data-prop-check` values

Action

Turn custom slot toggles on for Trigger, Content, Group, Item, Checkbox Item, Radio Group, Radio Item, Separator, Sub Trigger, Sub Content, and Sub Item.

Verify

□ Trigger Data includes `data-slot="context-menu-trigger-custom"`  
□ Each enabled menu part replaces its default `data-slot` with the `context-menu-*-custom` value  
□ Raw Data groups in Anatomy and Inspector show the slot values  
□ Source includes the enabled `data-slot` and `data-prop-check` props

Reset

Turn `Prop Check` and all custom slot toggles off.

## Step 10: Source

Setup

Default toolbar state. Menu closed.

Action

Open Canvas `Source`.

Verify

□ Source starts with `ContextMenu.Root`  
□ Default uncontrolled closed mode omits `open`, `defaultOpen`, and `onOpenChange` from Root  
□ Controlled mode shows `open={open}` and `onOpenChange={setOpen}` only when `State > Controlled` is enabled  
□ Default-valued Root and Content props such as `modal`, `closeOnSelect`, `closeOnEscape`, `loop`, `side`, `align`, and `sideOffset` are omitted until changed  
□ Trigger composition changes update Trigger JSX  
□ Popup `side`, `align`, `sideOffset`, and `ariaLabel` changes update Content JSX  
□ Props controls add and remove `data-prop-check` and `data-slot` props  
□ `Direction.Provider` appears only when direction is `rtl`  
□ Source does not include playground inspection refs or `data-playground-inspect`

## Step 11: Inspector / Logs

Setup

Canvas visible. Menu closed. Logs clear.

Action

Click or right-click Trigger, Content, Item, Checkbox Item, Radio Item, Sub Trigger, and Sub Content.

Verify

□ `Selected` Inspector updates to the clicked element  
□ `Focused` Inspector updates separately from Selected  
□ Raw Attributes, ARIA, and Data groups match Anatomy formatting  
□ Logs record open, close, select, checkbox, radio, and submenu events  
□ `Clear` empties logs without adding a fake log entry

## Step 12: Nested / Portal / Focus Behavior

Setup

Default toolbar state. Menu closed.

Action

Turn `Popup > Inside Dialog` on. Open the context menu inside the dialog and press `Escape`.

Verify

□ Context Menu closes before the parent Dialog  
□ Dialog remains open after the first Escape  
□ Content remains a valid focus target inside the modal focus scope

Action

Turn `Submenu > Nested submenu` on. Open the menu, open `More actions`, then open `Advanced`.

Verify

□ `Sub Trigger: Advanced` and `Sub Content: Advanced` Anatomy groups become active  
□ `Sub Content: Advanced` portals to `body`  
□ Escape closes the topmost submenu before the parent menu

Action

With a control immediately before and after the Context Menu owner, reopen and press `Tab`; repeat with `Shift+Tab`.

Verify

□ Tab closes every menu level and moves focus to the next control after the complete owner
□ Shift+Tab closes every menu level and moves focus to the previous control before the complete owner

Action

Open the menu, start an outside touch or pen gesture, then separately complete release, move, scroll, cancel, and add a second contact.

Verify

□ An uncancelled outside release closes the menu
□ Movement, scroll, pointer cancellation, and a second contact cancel outside dismissal

Action

Repeat the keyboard flow at 200% and 400% zoom and on a narrow viewport.

Verify

□ Real focused rows, Arrow, and long Content remain reachable and scrollable
□ Playground sticky controls do not hide the active item

Reset

Turn `Nested submenu` and `Inside Dialog` off.

## Step 13: Workbook Cleanup / Rewrite Notes

□ New Context Menu rows remain untested until the updated desktop, zoom, touch/pen, and named-device steps pass
□ Context Menu long press is tracked as an explicit Atom fallback contract, separately from inconsistent native browser `contextmenu` delivery
□ Props pass-through and custom slot override rows are covered by `Props > Prop Check`, slot toggles, Anatomy/Inspector raw Data, and Source
