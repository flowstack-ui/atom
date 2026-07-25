# Toolbar Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Toolbar scenario selected. Default toolbar state: `Loop` on, all disabled controls off, Orientation `horizontal`, Direction `Default`, Type `single`, Controlled off, Default Value `none`, all Composition controls `Default`, Prop Check off, all custom slot controls off.

Action

Load the page and open Anatomy, Canvas, Source, and Inspector.

Verify

□ Canvas renders a formatting toolbar with Undo, Redo, Help, a separator, and Bold/Italic toggle items.
□ Anatomy renders `Root`, `Button: Undo`, `Button: Redo`, `Link: Help`, `Separator`, `Toggle Group`, `Toggle Item: Bold`, and `Toggle Item: Italic` in that order.
□ Canvas toolbar groups include `State`, `Layout`, `Toggles`, `Composition`, and `Props`.
□ Props includes `Root Slot`, `Button Slot`, `Link Slot`, `Separator Slot`, `Toggle Group Slot`, `Toggle Item Slot`, and `Prop Check`.
□ Inspector tabs `Selected`, `Focused`, and `Logs` respond.
□ Source shows `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Link`, `Toolbar.Separator`, `Toolbar.ToggleGroup`, and `Toolbar.ToggleItem`.

## Step 1: Feature-Wide State

Setup

Default toolbar state. Canvas visible. Logs clear.

Action

Click Undo, Redo, Help, Bold, and Italic.

Verify

□ Undo logs `undo clicked`.
□ Redo logs `redo clicked`.
□ Help logs `help clicked`.
□ Bold changes to `data-state="on"` and Logs records `value changed bold`.
□ Italic changes to `data-state="on"` and Logs records `value changed italic`.

Action

Set `State > Disable Button`, `State > Disable Link`, `State > Disable Toggle Group`, and `State > Disable Toggle Item` on.

Verify

□ Redo has `disabled` and `data-disabled`.
□ Help has `aria-disabled="true"` and `data-disabled`.
□ Toggle Group has `data-disabled`.
□ Italic has `disabled`, `data-disabled`, and does not toggle when clicked.

Reset

Turn all disabled controls off.

## Step 2: Root

Setup

Default toolbar state. Open Anatomy `Root`.

Action

Inspect Root Attributes, ARIA, and Data.

Verify

□ Attributes tag is `div`.
□ Attributes include `dir="ltr"`.
□ ARIA includes `role="toolbar"`.
□ ARIA includes `aria-label="Formatting"`.
□ ARIA includes `aria-orientation="horizontal"`.
□ Data includes `data-slot="toolbar"`.
□ Data includes `data-orientation="horizontal"`.
□ Root rows show `Direction: default`, `Root direction: ltr`, `Loop: true`, and `Ref target: div`.

Action

Set `Layout > Orientation` to `vertical`.

Verify

□ Root ARIA changes to `aria-orientation="vertical"`.
□ Root Data changes to `data-orientation="vertical"`.
□ Source includes `orientation="vertical"`.

Action

Set `Layout > Direction` to `Provider RTL`.

Verify

□ Root Attributes show `dir="rtl"`.
□ Source wraps the toolbar in `<Direction.Provider dir="rtl">`.

Action

Set `Layout > Direction` to `Local LTR`.

Verify

□ Root Attributes show `dir="ltr"`.
□ Source keeps the provider wrapper and adds `dir="ltr"` to `Toolbar.Root`.

Action

Turn `State > Loop` off.

Verify

□ Source includes `loop={false}`.
□ Keyboard arrow navigation stops at the first or last enabled item instead of wrapping.

Action

Turn on `Props > Root Slot`.

Verify

□ Root Data includes `data-slot="toolbar-root-custom"`.
□ Source includes `data-slot="toolbar-root-custom"` on `Toolbar.Root`.

Action

Set `Composition > Root` to `As Child`, then `Render`.

Verify

□ Root Attributes tag changes to `section` in both modes.
□ Root ARIA and Data still include toolbar role, orientation, and active slot values.
□ Source reflects the selected Root composition mode.

Reset

Return Orientation `horizontal`, Direction `Default`, Loop on, Root composition `Default`, and turn `Root Slot` off.

## Step 3: Button

Setup

Default toolbar state. Open Anatomy `Button: Undo`.

Action

Inspect `Button: Undo`.

Verify

□ Attributes tag is `button`.
□ Attributes include `type="button"`.
□ Attributes include `tabindex="0"` for the first enabled toolbar item.
□ Data includes `data-slot="toolbar-button"`.
□ Button: Undo rows show `Ref target: button`.

Action

Turn on `Props > Prop Check`.

Verify

□ Primary button Data includes `data-prop-check="button"`.
□ Redo button Data includes `data-prop-check="button-secondary"`.
□ Source includes matching `data-prop-check` props for both buttons.

Action

Turn on `Props > Button Slot`.

Verify

□ Primary button Data includes `data-slot="toolbar-button-custom"`.
□ Redo button Data includes `data-slot="toolbar-button-custom"`.
□ Source includes matching `data-slot` props for both buttons.

Action

Set `Composition > Button` to `As Child`, then `Render`.

Verify

□ Button: Undo Attributes tag changes to `span` in both modes.
□ Button: Undo ARIA includes `role="button"` in both modes.
□ Source reflects the selected Button composition mode.

Action

Open Anatomy `Button: Redo`.

Verify

□ Attributes tag is `button`.
□ Data includes the active Button `data-slot`.
□ Attributes include `tabindex="-1"` while Undo is the roving focus entry point.
□ Rows show `Disabled: false`.

Action

Turn on `State > Disable Button`.

Verify

□ Redo Attributes include `disabled`.
□ Redo Data includes `data-disabled`.
□ Clicking Redo does not add a new `redo clicked` log entry.

Reset

Turn `Disable Button`, `Prop Check`, and `Button Slot` off. Set Button composition `Default`.

## Step 4: Link

Setup

Default toolbar state. Open Anatomy `Link: Help`.

Action

Inspect Link Attributes, ARIA, and Data.

Verify

□ Attributes tag is `a`.
□ Attributes include `href="#toolbar-link"`.
□ Attributes include `tabindex="-1"` while Undo is the roving focus entry point.
□ Data includes `data-slot="toolbar-link"`.
□ Link rows show `Ref target: a`.

Action

Turn on `Props > Prop Check`.

Verify

□ Link Data includes `data-prop-check="link"`.
□ Source includes `data-prop-check="link"`.

Action

Turn on `Props > Link Slot`.

Verify

□ Link Data includes `data-slot="toolbar-link-custom"`.
□ Source includes `data-slot="toolbar-link-custom"`.

Action

Set `Composition > Link` to `As Child`, then `Render`.

Verify

□ Link Attributes tag remains `a` in both modes.
□ Link Attributes still include `href="#toolbar-link"`.
□ Source reflects the selected Link composition mode.

Action

Turn on `State > Disable Link`.

Verify

□ Link ARIA includes `aria-disabled="true"`.
□ Link Data includes `data-disabled`.
□ Link Attributes no longer include `href`.
□ Clicking Help does not change the page hash.

Reset

Turn `Disable Link`, `Prop Check`, and `Link Slot` off. Set Link composition `Default`.

## Step 5: Separator

Setup

Default toolbar state. Open Anatomy `Separator`.

Action

Inspect Separator Attributes, ARIA, and Data.

Verify

□ Attributes tag is `div`.
□ ARIA includes `role="separator"`.
□ ARIA includes `aria-orientation="vertical"`.
□ Data includes `data-slot="toolbar-separator"`.
□ Data includes `data-orientation="vertical"`.

Action

Set `Layout > Orientation` to `vertical`.

Verify

□ Separator ARIA changes to `aria-orientation="horizontal"`.
□ Separator Data changes to `data-orientation="horizontal"`.
□ Source includes `Toolbar.Separator orientation="horizontal"`.

Action

Turn on `Props > Separator Slot`.

Verify

□ Separator Data includes `data-slot="toolbar-separator-custom"`.
□ Source includes `data-slot="toolbar-separator-custom"`.

Action

Set `Composition > Separator` to `As Child`, then `Render`.

Verify

□ Separator Attributes tag is `div` in As Child mode and `hr` in Render mode.
□ Separator ARIA still includes `role="separator"`.
□ Source reflects the selected Separator composition mode.

Reset

Set Orientation back to `horizontal`, Separator composition `Default`, and turn `Separator Slot` off.

## Step 6: Toggle Group

Setup

Default toolbar state. Open Anatomy `Toggle Group`.

Action

Inspect Toggle Group Attributes, ARIA, and Data.

Verify

□ Attributes tag is `div`.
□ ARIA includes `role="group"`.
□ ARIA includes `aria-label="Text style"`.
□ Data includes `data-slot="toolbar-toggle-group"`.
□ Rows show `Type: single`, `Controlled: false`, `Default value: none`, and `Disabled: false`.

Action

Set `Toggles > Default Value` to `bold`.

Verify

□ Bold Toggle Item Data changes to `data-state="on"`.
□ Source includes `defaultValue="bold"`.

Action

Turn on `Props > Toggle Group Slot`.

Verify

□ Toggle Group Data includes `data-slot="toolbar-toggle-group-custom"`.
□ Source includes `data-slot="toolbar-toggle-group-custom"`.

Action

Set `Composition > Toggle Group` to `As Child`, then `Render`.

Verify

□ Toggle Group Attributes tag changes to `section` in both modes.
□ Toggle Group ARIA still includes `role="group"` and `aria-label="Text style"`.
□ Source reflects the selected Toggle Group composition mode.

Action

Turn `Toggles > Controlled` on and set `Toggles > Value` to `italic`.

Verify

□ Rows show `Controlled: true`.
□ Italic Toggle Item Data changes to `data-state="on"`.
□ Source includes `value="italic"` and omits `defaultValue`.

Action

Set `Toggles > Type` to `multiple` and set `Toggles > Value` to `bold`.

Verify

□ Source includes `type="multiple"`.
□ Source includes `value={["bold"]}`.
□ Clicking Italic adds it to the selected value and Logs records the new value.

Reset

Set Type `single`, Controlled off, Default Value `none`, Toggle Group composition `Default`, and turn `Toggle Group Slot` off.

## Step 7: Toggle Item

Setup

Default toolbar state. Open Anatomy `Toggle Item: Bold`.

Action

Inspect `Toggle Item: Bold`.

Verify

□ Attributes tag is `button`.
□ Attributes include `type="button"`.
□ Attributes include `tabindex="-1"` while Undo is the roving focus entry point.
□ ARIA includes `aria-pressed="false"`.
□ Data includes `data-slot="toolbar-toggle-item"`.
□ Data includes `data-state="off"`.
□ Data includes `data-value="bold"`.
□ Rows show `Ref target: button`.

Action

Click Bold.

Verify

□ Bold ARIA changes to `aria-pressed="true"`.
□ Bold Data changes to `data-state="on"`.
□ Logs records `value changed bold`.

Action

Turn on `State > Disable Toggle Item`.

Verify

□ `Toggle Item: Italic` Attributes include `disabled`.
□ `Toggle Item: Italic` Data includes `data-disabled`.
□ Clicking Italic does not toggle it on.

Action

Turn on `Props > Prop Check`.

Verify

□ Bold Data includes `data-prop-check="toggle-item"`.
□ Italic Data includes `data-prop-check="toggle-item-secondary"`.

Action

Turn on `Props > Toggle Item Slot`.

Verify

□ Bold Data includes `data-slot="toolbar-toggle-item-custom"`.
□ Italic Data includes `data-slot="toolbar-toggle-item-custom"`.
□ Source includes matching `data-slot` props for both toggle items.

Action

Set `Composition > Toggle Item` to `As Child`, then `Render`.

Verify

□ Toggle Item: Bold Attributes tag changes to `span` in both modes.
□ Toggle Item: Bold ARIA includes `role="button"` and `aria-pressed`.
□ Source reflects the selected Toggle Item composition mode.

Reset

Turn `Disable Toggle Item`, `Prop Check`, and `Toggle Item Slot` off. Set Toggle Item composition `Default`.

## Step 8: Keyboard And Direction

Setup

Default toolbar state. Focus Undo.

Action

Press ArrowRight repeatedly.

Verify

□ Focus moves through Redo, Help, Bold, Italic in DOM order.
□ The focused toolbar item has `tabindex="0"` and the previously focused item changes to `tabindex="-1"`.
□ Disabled controls are skipped when their disabled toolbar controls are on.
□ With Loop on, ArrowRight from Italic wraps to Undo.

Action

Press Home, then End.

Verify

□ Home focuses Undo.
□ End focuses Italic, unless Italic is disabled, then the last enabled item receives focus.

Action

Set `Layout > Direction` to `Provider RTL`, focus Undo, then press ArrowLeft.

Verify

□ ArrowLeft moves focus forward through the horizontal toolbar in RTL.
□ ArrowRight moves focus backward in RTL.

Action

Set `Layout > Orientation` to `vertical`, focus Undo, then press ArrowDown and ArrowUp.

Verify

□ ArrowDown moves focus to the next enabled item.
□ ArrowUp moves focus to the previous enabled item.

Reset

Return Orientation `horizontal`, Direction `Default`, and disabled controls off.

## Step 9: Source

Setup

Default toolbar state. Canvas Source tab open.

Action

Inspect the default Source.

Verify

□ Source omits `orientation="horizontal"`, `dir="ltr"`, `loop={true}`, disabled false props, `type="single"`, empty `value`, empty `defaultValue`, `asChild`, `render`, `data-prop-check`, and custom `data-slot` props.
□ Source includes only the minimal public Toolbar JSX required to render all public parts and `ariaLabel="Formatting"`.

Action

Toggle each Toolbar control once.

Verify

□ Source updates for orientation, direction, loop, disabled states, toggle type, controlled value, default value, every Composition control, Prop Check, and every custom slot control.
□ Controlled `value` appears only when `Toggles > Controlled` is on.
□ `defaultValue` appears only when Controlled is off and Default Value is not `none`.

Reset

Return all controls to default and switch back to Canvas.

## Step 10: Inspector / Logs

Setup

Default toolbar state. Inspector visible. Logs clear.

Action

Click Root, Undo, Help, Separator, Toggle Group, Bold, and Italic in the canvas.

Verify

□ Inspector `Selected` shows raw Attributes, ARIA, and Data for each selected part.
□ Inspector `Focused` changes when focus moves through toolbar items.
□ Logs stays empty for pure inspection clicks and records only toolbar event actions or value changes.

Action

Click Undo, Help, Bold, and Italic.

Verify

□ Logs includes compact entries for `undo clicked`, `help clicked`, and value changes.
□ Logs footer count matches the visible entries.

## Workbook Cleanup / Rewrite Notes

□ Reopened custom `data-slot` override coverage because Toolbar now supports `data-slot` props on every public DOM part.
□ Removed Separator and ToggleGroup ref rows because those parts are not `forwardRef` components in package source.
□ Removed Root controlled/default/callback state rows because controlled state belongs to `Toolbar.ToggleGroup`.
□ Removed typeahead/search because Toolbar has no typeahead/search contract.
□ Leave all workbook rows untested until every protocol step passes in the browser.
