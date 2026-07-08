# Popover Manual Test Protocol

Use this file as the full tester-first checklist. In chat, run one step at a
time and stop after each step until the tester confirms pass or reports an
issue.

## Step 0: Playground Smoke Check

1. Open the playground at `http://127.0.0.1:5174/`.
2. From the top menu, choose `Overlays` > `Popover`.
3. Expect the page title to be `Popover`.
4. Expect the visible workbench order to be `Anatomy`, `Canvas`, then `Inspector`.
5. Expect the Canvas toolbar groups to include `State`, `Popup`, `Composition`, and `Props`.
6. Expect Canvas to show the `Open popover` trigger and `Outside focus target`.
7. In Inspector, expect tabs named `Selected`, `Focused`, and `Logs`.
8. In Canvas, switch to `Source`; expect the snippet to start with `<Popover.Root` and include `<Popover.Trigger>Open popover</Popover.Trigger>`.
9. Switch Canvas back to `Canvas`.

Pass condition: Popover is reachable, the workbench panels render, Source is available, and no workbook changes are made.

## Step 1: Feature-Wide State

1. Start from the default Popover scenario with Canvas visible.
2. Click `Open popover`.
3. Expected behavior: content opens and the event log records `opened`.
4. Click `Open popover` again.
5. Expected behavior: content closes and the event log records `closed`.
6. In `State`, enable `Default Open`.
7. Expected behavior: uncontrolled popover opens immediately and the event log records `uncontrolled defaultOpen set true`.
8. Disable `Default Open`.
9. Expected behavior: uncontrolled popover closes.
10. Enable `Controlled`.
11. Expected behavior: controlled action buttons `Open controlled` and `Close controlled` appear.
12. Click `Open controlled`.
13. Expected behavior: content opens and the event log records `opened by external control`.
14. Click `Close controlled`.
15. Expected behavior: content closes and the event log records `closed by external control`.
16. Disable `Controlled`.
17. Enable `Disabled`.
18. Click `Open popover`.
19. Expected behavior: popover remains closed; disabled state blocks pointer activation.
20. Disable `Disabled`.
21. Enable `Modal`.
22. Open the popover.
23. Press `Tab` repeatedly.
24. Expected behavior: focus stays within the popover content while modal is enabled.
25. Press `Escape`.
26. Expected behavior: popover closes.
27. Disable `Modal`.
28. Set `Trigger mode` to `Hover`.
29. Hover over `Open popover`.
30. Expected behavior: popover opens after the hover open delay.
31. Move pointer away from trigger and content.
32. Expected behavior: popover closes after the hover close delay.
33. Set `Trigger mode` back to `Click`.
34. Open the popover.
35. Click `Outside focus target`.
36. Expected behavior with `Outside closes` enabled: popover closes.
37. Open the popover again.
38. Disable `Outside closes`.
39. Click `Outside focus target`.
40. Expected behavior: popover remains open.
41. Re-enable `Outside closes`.
42. Close the popover if it is still open.

Pass condition: controlled/uncontrolled state, `defaultOpen`, disabled blocking, modal focus behavior, hover mode, and outside-close behavior all work without inspecting part-specific raw DOM.

## Step 2: Root

1. Open the `Root` Anatomy group.
2. Default Root state rows should be:
   - `Mode`: `uncontrolled`
   - `Open`: `no`
   - `Default open`: `no`
   - `Disabled`: `no`
   - `Modal`: `no`
   - `Trigger mode`: `click`
   - `Close outside`: `yes`
   - `Block trigger event`: `no`
   - `Block close event`: `no`
3. Confirm Root has no Attributes, ARIA, or Data raw DOM groups.
4. Confirm Root has no default tag and no `data-slot`; Root is behavior-only and renders context, not an inspectable DOM element.
5. Enable and disable each State toolbar control one at a time.
6. Expected Root rows update only as state summaries:
   - `Controlled` on changes `Mode` to `controlled`.
   - `Default Open` on changes `Default open` to `yes`.
   - `Disabled` on changes `Disabled` to `yes`.
   - `Modal` on changes `Modal` to `yes`.
   - `Trigger mode` set to `Hover` changes `Trigger mode` to `hover`.
   - `Outside closes` off changes `Close outside` to `no`.
7. In `Composition`, enable and disable `Block trigger event`.
8. Expected Root row `Block trigger event` changes between `yes` and `no`.
9. In `Composition`, enable and disable `Block close event`.
10. Expected Root row `Block close event` changes between `yes` and `no`.
11. Return controls to default:
    - `Controlled`: off
    - `Default Open`: off
    - `Disabled`: off
    - `Modal`: off
    - `Trigger mode`: `Click`
    - `Outside closes`: on
    - `Block trigger event`: off
    - `Block close event`: off

Pass condition: Root is verified only as a non-DOM state/anatomy summary, with no Trigger or Content inspection.

## Step 3: Anchor

1. In `Popup`, enable `Use anchor`.
2. Open the `Anchor` Anatomy group.
3. Default Anchor expected values:
   - `Exists`: `yes`
   - `Composition`: `default`
   - Attributes tag: `span`
   - Data: `data-slot="popover-anchor"`
4. Confirm rendered anchor text is `Anchor point`.
5. Confirm the visible Anchor target uses the same dashed box treatment in `Default`, `As Child`, and `Render` modes.
6. In `Props`, enable `Prop Check`.
7. Expected Anchor Data:
   - `data-slot="popover-anchor"`
   - `data-prop-check="anchor"`
8. Disable `Prop Check`.
9. In `Props`, enable `Anchor Slot`.
10. Expected Anchor Data:
   - `data-slot="popover-anchor-custom"`
11. Disable `Anchor Slot`.
12. In `Composition`, keep or set `Anchor` to `As Child`.
13. Expected Anchor values:
   - `Composition`: `asChild`
   - Attributes tag: `span`
   - Data: `data-slot="popover-anchor"`
   - text: `Anchor point`
   - no extra wrapper element around the child
14. In `Composition`, set `Anchor` to `Render`.
15. Expected Anchor values:
   - `Composition`: `render`
   - Attributes tag: `section`
   - Data: `data-slot="popover-anchor"`
   - text: `Anchor point`
16. Set Anchor composition to `Default`.
17. Expected default Anchor values:
   - `Composition`: `default`
   - Attributes tag: `span`
   - Data: `data-slot="popover-anchor"`
   - text: `Anchor point`
   - visible dashed child still appears, but this mode is for default DOM evidence rather than the clearest positioning demo because Atom's default Anchor uses `display: contents`.
18. Disable `Use anchor`.
19. Expected Anchor summary: `not rendered`.

Pass condition: Anchor identity, data, prop pass-through, custom slot, and composition are complete without checking other parts.

## Step 4: Trigger

1. Open the `Trigger` Anatomy group.
2. Default closed Trigger expected values:
   - `Exists`: `yes`
   - `Composition`: `default`
   - Attributes tag: `button`
   - Attributes: `type="button"`
   - ARIA: `aria-expanded="false"`
   - ARIA: `aria-haspopup="dialog"`
   - ARIA: no `aria-controls`
   - ARIA: no `aria-disabled`
   - Data: `data-slot="popover-trigger"`
   - Data: `data-state="closed"`
   - Data: `data-trigger-mode="click"`
   - Data: no `data-disabled`
   - Data: no `data-prop-check`
3. Click `Open popover`.
4. Expected open Trigger values:
   - ARIA: `aria-expanded="true"`
   - ARIA: `aria-haspopup="dialog"`
   - ARIA: `aria-controls` references the currently mounted Content id.
   - Data: `data-slot="popover-trigger"`
   - Data: `data-state="open"`
   - Data: `data-trigger-mode="click"`
5. Click `Open popover` again.
6. Expected closed Trigger values:
   - ARIA: `aria-expanded="false"`
   - ARIA: no `aria-controls`
   - Data: `data-state="closed"`
7. In `Props`, enable `Prop Check`.
8. Expected Trigger Data:
   - `data-slot="popover-trigger"`
   - `data-prop-check="trigger"`
   - `data-state="closed"`
   - `data-trigger-mode="click"`
9. Disable `Prop Check`.
10. In `Props`, enable `Trigger Slot`.
11. Expected Trigger Data:
   - `data-slot="popover-trigger-custom"`
   - `data-state="closed"`
   - `data-trigger-mode="click"`
12. Disable `Trigger Slot`.
13. In `State`, enable `Disabled`.
14. Expected disabled Trigger values:
   - Attributes tag: `button`
   - Attributes: `type="button"`
   - Attributes: `disabled`
   - ARIA: `aria-disabled="true"`
   - ARIA: `aria-expanded="false"`
   - ARIA: `aria-haspopup="dialog"`
   - Data: `data-slot="popover-trigger"`
   - Data: `data-state="closed"`
   - Data: `data-trigger-mode="click"`
   - Data: `data-disabled`
15. Disable `Disabled`.
16. Set `Trigger mode` to `Hover`.
17. Expected Trigger Data:
   - `data-slot="popover-trigger"`
   - `data-state="closed"`
   - `data-trigger-mode="hover"`
18. Set `Trigger mode` back to `Click`.
19. In `Composition`, set `Trigger` to `As Child`.
20. Expected Trigger values:
   - `Composition`: `asChild`
   - Attributes tag: `span`
   - Attributes: `role="button"`
   - Attributes: `tabindex="0"`
   - ARIA: `aria-expanded="false"`
   - ARIA: `aria-haspopup="dialog"`
   - Data: `data-slot="popover-trigger"`
   - Data: `data-state="closed"`
   - Data: `data-trigger-mode="click"`
21. Focus the Trigger and press `Enter`.
22. Expected Trigger open values:
   - ARIA: `aria-expanded="true"`
   - ARIA: `aria-controls` references the currently mounted Content id.
   - Data: `data-state="open"`
23. Press `Escape` to close, because focus moves into the open popover content.
24. Focus Trigger and press `Space`.
25. Expected Trigger open values:
   - ARIA: `aria-expanded="true"`
   - ARIA: `aria-controls` references the currently mounted Content id.
   - Data: `data-state="open"`
26. Press `Escape` to close.
27. Expected Trigger closed values:
   - ARIA: `aria-expanded="false"`
   - ARIA: no `aria-controls`
   - Data: `data-state="closed"`
28. In `Composition`, set `Trigger` to `Render`.
29. Expected Trigger values:
   - `Composition`: `render`
   - Attributes tag: `section`
   - Attributes: `role="button"`
   - Attributes: `tabindex="0"`
   - Data: `data-slot="popover-trigger"`
   - Data: `data-state="closed"`
   - Data: `data-trigger-mode="click"`
30. In `Composition`, enable `Block trigger event`.
31. Click Trigger.
32. Expected Trigger remains `data-state="closed"`.
33. Focus Trigger and press `Enter`.
34. Expected Trigger remains `data-state="closed"`.
35. Disable `Block trigger event`.
36. Set Trigger composition back to `Default`.

Pass condition: Trigger identity, raw Data, ARIA, props/slots, composition, and activation are verified without Root, Content, or Logs requirements.

## Step 5: Portal

1. Open the popover.
2. Open the `Portal` Anatomy group.
3. Default `Body` mode expected values:
   - `Mode`: `body`
   - `Content exists`: `yes`
   - `Target exists`: `yes`
   - `Parent`: `body`
   - `Inside canvas`: `no`
   - `In custom target`: `no`
4. Open Canvas > Source.
5. Expected Portal source: `<Popover.Portal>` with no `container` prop and no `disabled` prop.
6. Switch back to Canvas.
7. In `Popup`, set `Portal` to `Container`.
8. Open the popover if it closed.
9. Expected Portal values:
   - `Mode`: `container`
   - `Content exists`: `yes`
   - `Target exists`: `yes`
   - `Parent`: `div`
   - `Inside canvas`: `yes`
   - `In custom target`: `yes`
10. Open Source.
11. Expected Portal source includes `<Popover.Portal container={portalContainer}>`.
12. Switch back to Canvas.
13. In `Popup`, set `Portal` to `Disabled`.
14. Open the popover if it closed.
15. Expected Portal values:
   - `Mode`: `disabled`
   - `Content exists`: `yes`
   - `Target exists`: `yes`
   - `Parent`: inline React parent, not `body`
   - `Inside canvas`: `yes`
   - `In custom target`: `no`
16. Open Source.
17. Expected Portal source includes `<Popover.Portal disabled>`.
18. Set `Portal` back to `Body`.

Pass condition: Portal mode behavior and matching Source output are verified without testing Content-specific attributes.

## Step 6: Content

1. Open the popover.
2. Open the `Content` Anatomy group.
3. Default Content expected values:
   - `Exists`: `yes`
   - Attributes tag: `div`
   - Attributes: `role="dialog"`
   - Attributes: `tabindex="-1"`
   - ARIA: `aria-label="Project quick actions"`
   - ARIA: no `aria-modal`
   - Data: `data-slot="popover-content"`
   - Data: `data-state="open"`
   - Data: `data-side="bottom"`
   - Data: `data-positioned`
   - `Side`: `bottom`
   - `Align`: `center`
   - `Offset`: `8`
   - `Nested enabled`: `no`
   - `Nested content`: `no`
4. In `Props`, enable `Prop Check`.
5. Expected Content Data:
   - `data-slot="popover-content"`
   - `data-prop-check="content"`
   - `data-state="open"`
   - `data-side="bottom"`
   - `data-positioned`
6. Disable `Prop Check`.
7. In `Props`, enable `Content Slot`.
8. Expected Content Data:
   - `data-slot="popover-content-custom"`
   - `data-state="open"`
   - `data-side="bottom"`
   - `data-positioned`
9. Disable `Content Slot`.
10. Disable `Use ariaLabel`.
11. Expected Content ARIA: no `aria-label`.
12. Enable `Use ariaLabel`.
13. Expected Content ARIA: `aria-label="Project quick actions"`.
14. Enable `Modal`.
15. Expected Content ARIA:
   - `aria-label="Project quick actions"`
   - `aria-modal="true"`
16. Disable `Modal`.
17. Set `Side` to `Top`.
18. Expected Content `Side` row: `top`; expected Data `data-side="top"` unless collision flips it.
19. Set `Side` to `Right`.
20. Expected Content `Side` row: `right`; expected Data `data-side="right"` unless collision flips it.
21. Set `Side` to `Left`.
22. Expected Content `Side` row: `left`; expected Data `data-side="left"` unless collision flips it.
23. Set `Side` back to `Bottom`.
24. Set `Align` to `Start`, `Center`, then `End`.
25. Expected Content `Align` row changes to `start`, `center`, then `end`.
26. Set `Offset` to `0`, `8`, then `16`.
27. Expected Content `Offset` row changes to `0`, `8`, then `16`.
28. Return `Align` to `Center` and `Offset` to `8`.

Pass condition: Content identity, role, ARIA, `data-state`, `data-side`, `data-positioned`, placement controls, props, and slots are verified without nested behavior or logs.

## Step 7: Arrow

1. Open the popover.
2. Open the `Arrow` Anatomy group.
3. Default bottom Arrow expected values:
   - `Exists`: `yes`
   - `Composition`: `default`
   - `Size`: `default`
   - Attributes tag: `svg`
   - Anatomy row `height`: `5`
   - Anatomy row `width`: `10`
   - ARIA: `aria-hidden="true"`
   - Data: `data-slot="popover-arrow"`
   - Data: `data-side="bottom"`
4. In `Props`, enable `Prop Check`.
5. Expected Arrow Data:
   - `data-slot="popover-arrow"`
   - `data-prop-check="arrow"`
   - `data-side` matches current Arrow side.
6. Disable `Prop Check`.
7. In `Props`, enable `Arrow Slot`.
8. Expected Arrow Data:
   - `data-slot="popover-arrow-custom"`
   - `data-side` matches current Arrow side.
9. Disable `Arrow Slot`.
10. Set `Arrow Size` to `Wide`.
11. Expected bottom/top Arrow values:
   - Anatomy row `width`: `16`
   - Anatomy row `height`: `8`
12. Set `Side` to `Right`.
13. Expected right/left wide Arrow values:
   - Data: `data-side="right"` unless collision flips it.
   - Anatomy row `width`: `8`
   - Anatomy row `height`: `16`
14. Set `Side` back to `Bottom`.
15. Set `Arrow Size` back to `Default`.
16. Expected bottom/top default Arrow values:
   - Anatomy row `width`: `10`
   - Anatomy row `height`: `5`
17. Set `Arrow` composition to `As Child`.
18. Expected Arrow values:
   - `Composition`: `asChild`
   - Attributes tag: `svg`
   - ARIA: `aria-hidden="true"`
   - Data: `data-slot="popover-arrow"`
   - Data: `data-side` matches current Arrow side.
   - Arrow remains visible.
19. Set `Arrow` composition to `Render`.
20. Expected Arrow values:
   - `Composition`: `render`
   - Attributes tag: `svg`
   - ARIA: `aria-hidden="true"`
   - Data: `data-slot="popover-arrow"`
   - Data: `data-side` matches current Arrow side.
21. Set Arrow composition back to `Default`.

Pass condition: Arrow identity, ARIA, `data-side`, size, props/slots, and composition are verified without Content or Portal checks.

## Step 8: Close

1. Open the popover.
2. Open the `Close` Anatomy group.
3. Default Close expected values:
   - `Exists`: `yes`
   - `Composition`: `default`
   - Attributes tag: `button`
   - Attributes: `type="button"`
   - Data: `data-slot="popover-close"`
4. Click `Close`.
5. Expected behavior: popover closes.
6. Open the popover again.
7. In `Props`, enable `Prop Check`.
8. Expected Close Data:
   - `data-slot="popover-close"`
   - `data-prop-check="close"`
9. Disable `Prop Check`.
10. In `Props`, enable `Close Slot`.
11. Expected Close Data:
   - `data-slot="popover-close-custom"`
12. Disable `Close Slot`.
13. Set `Close button` composition to `As Child`.
14. Expected Close values:
   - `Composition`: `asChild`
   - Attributes tag: `span`
   - Data: `data-slot="popover-close"`
15. Click Close.
16. Expected behavior: popover closes.
17. Open the popover again.
18. Set `Close button` composition to `Render`.
19. Expected Close values:
   - `Composition`: `render`
   - Attributes tag: `section`
   - Data: `data-slot="popover-close"`
20. Click Close.
21. Expected behavior: popover closes.
22. Open the popover again.
23. Enable `Block close event`.
24. Click Close.
25. Expected behavior: popover remains open.
26. Disable `Block close event`.
27. Set Close composition back to `Default`.

Pass condition: Close identity, props/slots, composition, close behavior, and close-event blocking are verified without log inspection.

## Step 9: Source

1. Open Canvas > Source.
2. Default source expected values:
   - Starts with `<Popover.Root`
   - Includes `onOpenChange={setOpen}`
   - Does not include `defaultOpen`
   - Does not include `modal`
   - Does not include `disabled`
   - Does not include `triggerMode="click"`
   - Does not include `closeOnInteractOutside={false}`
   - Includes `<Popover.Trigger>Open popover</Popover.Trigger>`
   - Includes `<Popover.Portal>`
   - Includes `ariaLabel="Project quick actions"`
   - Includes `side="bottom"`
   - Includes `align="center"`
   - Includes `sideOffset={8}`
   - Includes `<Popover.Close>Close</Popover.Close>`
   - Includes `<Popover.Arrow />`
3. Enable `Default Open`.
4. Expected Source includes `defaultOpen`.
5. Enable `Controlled`.
6. Expected Source includes `open={open}` and no `defaultOpen`.
7. Enable `Modal`.
8. Expected Source includes `modal`.
9. Enable `Disabled`.
10. Expected Source includes `disabled`.
11. Set `Trigger mode` to `Hover`.
12. Expected Source includes `triggerMode="hover"`.
13. Disable `Outside closes`.
14. Expected Source includes `closeOnInteractOutside={false}`.
15. Set Portal to `Container`.
16. Expected Source includes `<Popover.Portal container={portalContainer}>`.
17. Set Portal to `Disabled`.
18. Expected Source includes `<Popover.Portal disabled>`.
19. Enable `Use anchor`.
20. Expected Source includes `<Popover.Anchor>` with a child `<span>Anchor point</span>`.
21. Set Trigger, Anchor, Arrow, and Close composition one at a time to `As Child`.
22. Expected Source includes the matching `asChild` prop for each active part.
23. Set Trigger, Anchor, Arrow, and Close composition one at a time to `Render`.
24. Expected Source includes `render={<section />}` for Trigger, Anchor, and Close, and `render={<svg />}` for Arrow.
25. Enable `Prop Check`.
26. Expected Source includes:
   - `data-prop-check="anchor"` when Anchor is rendered
   - `data-prop-check="trigger"`
   - `data-prop-check="content"`
   - `data-prop-check="arrow"`
   - `data-prop-check="close"`
27. Enable every custom slot.
28. Expected Source includes:
   - `data-slot="popover-anchor-custom"` when Anchor is rendered
   - `data-slot="popover-trigger-custom"`
   - `data-slot="popover-content-custom"`
   - `data-slot="popover-arrow-custom"`
   - `data-slot="popover-close-custom"`
29. Set `Arrow Size` to `Wide`.
30. Expected Source includes `<Popover.Arrow` with `width={16}` and `height={8}`.
31. Enable `Nested Popover`.
32. Expected Source includes nested `<Popover.Root>`, nested `<Popover.Trigger>Nested popover</Popover.Trigger>`, nested `<Popover.Content ariaLabel="Nested quick actions" side="right" align="start">`, nested `<Popover.Close>Close nested</Popover.Close>`, and nested `<Popover.Arrow />`.
33. Enable `Block trigger event`.
34. Expected Source includes Trigger event props:
   - `onClick={(event) => event.preventDefault()}`
   - `onKeyDown={(event) => event.preventDefault()}`
35. Enable `Block close event`.
36. Expected Source includes Close event prop:
   - `onClick={(event) => event.preventDefault()}`

Pass condition: Source output exactly tracks active consumer-facing props and omits default false props and playground-only inspection plumbing.

## Step 10: Inspector / Logs

1. Switch Canvas to `Canvas` and Inspector to `Selected`.
2. Click the Trigger.
3. Expected Selected Inspector:
   - tag: `button`
   - Attributes include `type="button"`
   - ARIA includes `aria-expanded="true"`
   - ARIA includes `aria-haspopup="dialog"`
   - ARIA includes `aria-controls` referencing current Content id.
   - Data includes `data-slot="popover-trigger"`
   - Data includes `data-state="open"`
   - Data includes `data-trigger-mode="click"`
4. Click Content.
5. Expected Selected Inspector:
   - tag: `div`
   - Attributes include `role="dialog"`
   - Attributes include `tabindex="-1"`
   - ARIA includes `aria-label="Project quick actions"`
   - Data includes `data-slot="popover-content"`
   - Data includes `data-state="open"`
   - Data includes `data-side="bottom"`
   - Data includes `data-positioned`
6. Click Arrow.
7. Expected Selected Inspector:
   - tag: `svg`
   - ARIA includes `aria-hidden="true"`
   - Data includes `data-slot="popover-arrow"`
   - Data includes `data-side` matching the rendered arrow side.
8. Click Close while the popover is open.
9. Reopen the popover if it closes before selection is visible.
10. Expected Selected Inspector for Close:
   - tag: `button`
   - Attributes include `type="button"`
   - Data includes `data-slot="popover-close"`
11. Switch Inspector to `Focused`.
12. Click `Focus Canvas`.
13. Expected Focused Inspector shows the current focusable Popover trigger or first focusable canvas element.
14. Open the popover and Tab into content.
15. Expected Focused Inspector updates to the focused element inside Content.
16. Switch Inspector to `Logs`.
17. Expected log entries from the current test session may include:
   - `opened`
   - `closed`
   - `trigger user onClick`
   - `trigger user onKeyDown Enter`
   - `trigger user onKeyDown Space`
   - `opened by external control`
   - `closed by external control`
   - `trigger user onClick blocked toggle`
   - `trigger user onKeyDown blocked Enter`
   - `close user onClick`
   - `close user onClick blocked close`
18. Click `Clear Logs`.
19. Expected Logs panel becomes empty and event count is `0 events`.

Pass condition: Selected, Focused, and Logs work as inspector surfaces without introducing new component behavior checks.

## Step 11: Nested / Portal / Focus Behavior

1. Ensure `Modal` is off.
2. Set `Portal` to `Body`.
3. Enable `Nested Popover`.
4. Open the outer popover.
5. Click `Nested popover`.
6. Expected behavior: outer Content remains open and nested Content opens.
7. Expected nested Content values:
   - Attributes tag: `div`
   - Attributes: `role="dialog"`
   - Attributes: `tabindex="-1"`
   - ARIA: `aria-label="Nested quick actions"`
   - Data: `data-slot="popover-content"`
   - Data: `data-state="open"`
   - Data: `data-side="right"` unless collision flips it.
   - Data: `data-positioned`
8. Press `Escape` once.
9. Expected behavior: nested Content closes and outer Content remains open.
10. Press `Escape` again.
11. Expected behavior: outer Content closes.
12. Reopen the outer popover.
13. Click `Outside focus target`.
14. Expected behavior with `Outside closes` enabled: outer Content closes.
15. Reopen the outer popover.
16. Disable `Outside closes`.
17. Click `Outside focus target`.
18. Expected behavior: outer Content remains open.
19. Re-enable `Outside closes`.
20. Enable `Modal`.
21. Open the outer popover.
22. Press `Tab` repeatedly.
23. Expected behavior: focus remains inside Content while modal is on.
24. Disable `Modal`.
25. Set `Portal` back to `Body`.
26. Disable `Nested Popover`.

Pass condition: nested popover, Escape top-layer order, outside close, and modal focus containment work in the integrated overlay case.

## Step 12: Workbook Cleanup / Rewrite Notes

This step records workbook notes only. It is not manual testing.

1. Do not edit `component-coverage.xlsx` until all manual testing steps pass.
2. Mark these workbook rows as stale or rewrite candidates after testing:
   - Root default tag row: Root renders no DOM element.
   - Root `data-slot` row: Root has no DOM slot.
   - Root native prop passthrough row: Root does not accept DOM native props.
   - Root ref row: Root has no rendered DOM element for consumer ref.
   - Portal default tag row: Portal wrapper renders no inspectable Atom DOM part.
   - Portal `data-slot` row: Portal has no DOM slot.
   - Portal native prop passthrough row: Portal props are portal utility props, not DOM passthrough.
   - Portal ref row: Portal has no rendered DOM element for consumer ref.
3. Record Arrow docs/workbook mismatch:
   - Package source default Arrow size is `width=10`, `height=5`.
   - Existing public docs mention `width=12`, `height=6`.
   - Classify this as documentation/workbook cleanup unless package maintainers decide source should change.
4. Keep manual-only rows for mobile/touch and collision/flip/shift as viewport behavior, not exact stable DOM rows.
5. Consider adding explicit workbook rows for:
   - Portal mode `body`, `container`, and `disabled`.
   - Arrow composition `Default`, `As Child`, and `Render`.
   - Arrow wide size `width={16}` and `height={8}`.
   - Nested Popover Escape closes top layer first.

Pass condition: workbook cleanup notes are captured separately from pass/fail manual test execution and the workbook remains unchanged until all steps are complete.
