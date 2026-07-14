# Menubar Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Menubar scenario selected. Default toolbar state.

Action

Load the playground and open Menubar from the top menu.

Verify

□ Scenario title shows `Menubar`  
□ Anatomy starts with Menubar-owned parts and representative shared Menu parts  
□ Canvas renders only a horizontal menubar with `File` and `View` triggers  
□ Canvas toolbar shows `State`, `Popup`, and `Props`  
□ Source opens and shows `Menubar.Root` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors  
□ No changes are made to `component-coverage.xlsx`

## Step 1: Root State And Direction

Setup

Default toolbar state. Props off. Menubar closed. Direction `ltr`. Direction mode `provider`.

Action

Turn `State > Controlled` on. Use `State > Controlled value` actions: `Open File`, `Open View`, `Close`.

Verify

□ Root current value changes between `file`, `view`, and `none`  
□ Footer changes between closed, `file`, and `view`  
□ Logs include controlled open and close entries

Action

Turn `Controlled` off. Set `Default value` to `file`, then `view`, then `none`.

Verify

□ `file` initially opens File Content after remount  
□ `view` initially opens View Content after remount  
□ `none` returns Menubar to closed uncontrolled state

Action

Set Direction to `rtl`. Switch Direction mode between `provider` and `root`.

Verify

□ Root DOM `dir` is `rtl` in both modes  
□ Source uses `Direction.Provider dir="rtl"` in provider mode  
□ Source uses `Menubar.Root dir="rtl"` in root mode  
□ File submenu opens to the left in both direction modes

Reset

Controlled off. Default value `none`. Direction `ltr`. Direction mode `provider`. Menubar closed.

## Step 2: Menu Behavior

Setup

Default toolbar state. Menubar closed.

Action

Open Anatomy `Menu`. Open File, then View.

Verify

□ File menu value is `file`  
□ View menu value is `view`  
□ Root current value follows the active menu  
□ `Close on select`, `Escape closes`, and `Menu loop` are `true`

Action

Open File. Select `New project`. Reopen File, turn `Close on select` off, and select `New project` again.

Verify

□ With `Close on select` on, selection closes File Content  
□ With `Close on select` off, selection keeps File Content open

Action

Open File. Turn `Escape closes` off and press Escape, then turn it on and press Escape.

Verify

□ With `Escape closes` off, File Content remains open  
□ With `Escape closes` on, Escape closes File Content

Action

Open File. Turn `Menu loop` off and use ArrowUp / ArrowDown inside File Content at item boundaries.

Verify

□ Item focus inside File Content does not wrap while `Menu loop` is off  
□ Top-level trigger wrapping is still controlled by Root `Loop`  
□ Re-enabling `Menu loop` restores item wrapping inside File Content

Reset

Turn `Close on select`, `Escape closes`, and `Menu loop` on. Menubar closed.

## Step 3: Trigger And Top-Level Focus

Setup

Default toolbar state. Menubar closed. Props off.

Action

Open Anatomy `Trigger`.

Verify

□ File Trigger tag is `button`  
□ File Trigger has `role="menuitem"`  
□ File Trigger has `aria-haspopup="menu"`  
□ File Trigger has `aria-expanded="false"` while closed  
□ File Trigger Data includes `data-slot="menubar-trigger"`  
□ File Trigger Data includes `data-state="closed"`  
□ View Trigger is present with the same trigger semantics

Action

Use pointer, Enter, and Space on top-level triggers.

Verify

□ Pointer opens and closes the trigger menu  
□ Enter opens and closes the focused trigger menu  
□ Space opens and closes the focused trigger menu  
□ Open Trigger changes to `data-state="open"` and `aria-expanded="true"`

Action

Open File. ArrowRight to View. Press Escape. Repeat from View with ArrowLeft to File.

Verify

□ Adjacent menu handoff opens the new active menu  
□ Escape closes the active menu  
□ Focus returns to the active trigger, not the previous trigger

Action

Turn `State > File disabled` on and try pointer and keyboard activation.

Verify

□ File Trigger Data includes `data-disabled`  
□ File Trigger is disabled in native DOM  
□ File Content does not open from File activation

Reset

Turn `File disabled` off. Menubar closed.

## Step 4: Top-Level Keyboard And RTL

Setup

Default toolbar state. Menubar closed. Direction `ltr`. Root `Loop` on.

Action

Focus File. Press ArrowRight, ArrowLeft, Home, and End.

Verify

□ ArrowRight moves focus from File to View  
□ ArrowLeft moves focus from View to File  
□ Home moves focus to File  
□ End moves focus to View  
□ Focused Inspector evidence follows the active trigger

Action

Open File with ArrowDown, close it, then open File with ArrowUp.

Verify

□ ArrowDown opens File Content and seeds the first item highlight  
□ ArrowUp opens File Content and seeds the last item highlight

Action

Set Direction to `rtl` and repeat ArrowRight / ArrowLeft between File and View.

Verify

□ RTL mirrors top-level ArrowRight and ArrowLeft behavior  
□ Adjacent open-menu handoff also mirrors in RTL

Reset

Direction `ltr`. Menubar closed.

## Step 5: Shared Menu Integration Smoke

Setup

Default toolbar state. Menubar closed.

Action

Open File. Select `New project`. Reopen File and toggle `Show grid` from the checkbox item.

Verify

□ Item selection logs `selected new`  
□ Checkbox Item toggles checked/unchecked state  
□ Checkbox Item exposes `role="menuitemcheckbox"` and `aria-checked`

Action

Open View. Select `Compact`, then `Comfortable` from the radio items.

Verify

□ Radio selection is exclusive  
□ Checked Radio Item exposes `role="menuitemradio"` and `aria-checked="true"`

Action

Open File. Open `Share` submenu, then close with Escape.

Verify

□ Sub Trigger opens Sub Content  
□ Sub Content exposes `role="menu"`  
□ Escape closes the submenu before the parent menu  
□ Parent menu remains usable after submenu close

Reset

Menubar closed. Checkbox checked. Density `comfortable`.

## Step 6: Content Accessibility And Positioning Smoke

Setup

Default toolbar state. Open File.

Action

Open Anatomy `Content`.

Verify

□ File Content tag is `div`  
□ ARIA includes `role="menu"`  
□ ARIA includes `aria-label="File menu"`  
□ Data includes `data-slot="menu-content"`  
□ Data includes `data-state="open"`  
□ Data includes `data-side`, `data-align`, and `data-positioned`

Action

Turn `Popup > Content ariaLabel` off, then on. Reopen File.

Verify

□ `aria-label` is removed and restored  
□ Source reflects the `ariaLabel` toggle  
□ Default positioning data remains present after the accessibility toggle

Reset

Content ariaLabel on. Menubar closed.

## Step 7: Props And Slots

Setup

Default toolbar state. Menubar closed. Props off.

Action

Turn `Props > Prop Check` on.

Verify

□ Root exposes `data-prop-check="root"` in raw Data evidence  
□ Other tested public DOM parts expose their `data-prop-check` values  
□ Non-DOM parts such as `Menu` and `Sub` are not treated as DOM prop-check targets

Action

Turn custom slot toggles on for Root, Trigger, Content, Item, and Sub Content.

Verify

□ Each tested rendered public DOM part exposes its custom `data-slot` value  
□ Root uses `data-slot="menubar-root-custom"`  
□ Trigger uses `data-slot="menubar-trigger-custom"`  
□ Content, Item, and Sub Content use their representative `menubar-*-custom` slot values  
□ Other shared Menu parts remain present for integration but are not exhaustively slot-tested here

Reset

Turn Prop Check and all custom slot toggles off. Menubar closed.

## Step 8: Source / Inspector / Logs

Setup

Default toolbar state. Logs clear.

Action

Toggle Menubar-owned controls: Controlled, Default value, Loop, Menu loop, Close on select, Escape closes, Direction, Direction mode, Content ariaLabel, Prop Check, and representative custom slots.

Verify

□ Source updates for each Menubar-owned toggle  
□ Source shows public Atom JSX only  
□ Inspector Selected and Focused tabs update independently  
□ Logs record open, close, controlled actions, and item selection  
□ Clearing logs removes log rows and keeps the scenario usable

Reset

Return toolbar to default state.

## Workbook Cleanup / Rewrite Notes

Workbook cleanup was completed after this protocol passed. Menubar-owned
behavior is covered deeply, while shared Menu parts remain integration-smoke
coverage. Every current Menubar row is implemented, tested, and covered.
