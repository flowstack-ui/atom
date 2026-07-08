# Feed Manual Test Protocol

Use this file as the full tester-first QA procedure. In chat, run one step at a
time and stop after each step until the tester confirms pass or reports an
issue.

## Step 0: Playground Smoke Check

1. Open the playground at `http://localhost:5174/`.
2. From the top menu, choose `Data` > `Feed`.
3. Expect the page title to be `Feed`.
4. Expect the visible workbench order to be `Anatomy`, `Canvas`, then `Inspector`.
5. Expect the Canvas toolbar groups to include `State`, `Keyboard`, `Composition`, and `Props`.
6. Expect Canvas to show `Before feed`, a scrollable feed preview, and `After feed`.
7. Expect the feed preview to show three articles: `Deploy reviewed`, `Billing updated`, and `Design feedback`.
8. In Inspector, expect tabs named `Selected`, `Focused`, and `Logs`.
9. In Canvas, switch to `Source`; expect the snippet to start with `<Feed.Root setSize={3}>` and include `<Feed.Item index={0}>`.
10. Switch Canvas back to `Canvas`.

Pass condition: Feed is reachable, the workbench panels render, Source is available, and no workbook changes are made.

## Step 1: Feature-Wide State

1. Start from the default Feed scenario with Canvas visible.
2. In `State`, confirm defaults:
   - `Busy`: off
   - `Set size`: `Known`
   - `Items`: `Three`
   - `Position`: `Index`
   - `Item set size`: off
3. Open the `Root` Anatomy group.
4. Expected Root state rows:
   - `Busy`: `false`
   - `Set size`: `known`
   - `Item count`: `3`
   - `Position mode`: `index`
   - `Item set size override`: `false`
5. In `State`, enable `Busy`.
6. Expected Root live DOM:
   - ARIA: `aria-busy="true"`
   - Data: `data-busy`
7. Disable `Busy`.
8. In `State`, set `Set size` to `Unknown`.
9. Expected Item live DOM:
   - ARIA: `aria-setsize="-1"`
   - Data: `data-setsize="unknown"`
10. Set `Set size` back to `Known`.
11. In `State`, set `Items` to `Four`.
12. Expected Canvas: four feed articles are visible.
13. Expected `Item: Last` Anatomy summary references `4 of known`.
14. Set `Items` back to `Three`.
15. In `State`, set `Position` to `Position`.
16. Expected first Item live DOM:
   - ARIA: `aria-posinset="11"`
   - ARIA: `aria-setsize="100"`
   - Data: `data-position="11"`
   - Data: `data-setsize="100"`
17. Set `Position` back to `Index`.
18. In `State`, enable `Item set size`.
19. Expected first Item live DOM:
   - ARIA: `aria-setsize="10"`
   - Data: `data-setsize="10"`
20. Disable `Item set size`.

Pass condition: busy state, known and unknown set sizes, item count, explicit positions, and item-level set size override update live DOM without checking composition or prop pass-through.

## Step 2: Root

### Identity

1. Open the `Root` Anatomy group.
2. Default Root expected values:
   - `Ref target`: `div`
   - `Composition`: `default`
   - Attributes tag: `div`
   - Attributes: no `aria-busy`
   - ARIA: `role="feed"`
   - Data: `data-slot="feed"`
   - Data: no `data-busy`
   - Data: no `data-prop-check`

### Props / Slots

1. In `Props`, enable `Prop Check`.
2. Expected Root Data:
   - `data-slot="feed"`
   - `data-prop-check="root"`
3. Disable `Prop Check`.
4. In `Props`, enable `Root Slot`.
5. Expected Root Data:
   - `data-slot="feed-custom"`
6. Disable `Root Slot`.

### Composition

1. In `Composition`, set `Root` to `As Child`.
2. Expected Root values:
   - `Composition`: `asChild`
   - `Ref target`: `section`
   - Attributes tag: `section`
   - ARIA: `role="feed"`
   - Data: `data-slot="feed"`
   - no extra wrapper around the child section
3. In `Composition`, set `Root` to `Render`.
4. Expected Root values:
   - `Composition`: `render`
   - `Ref target`: `section`
   - Attributes tag: `section`
   - ARIA: `role="feed"`
   - Data: `data-slot="feed"`
5. Set `Root` back to `Default`.

Pass condition: Root identity, ARIA, data attributes, prop pass-through, custom slot, ref target, and composition are verified without checking Item-specific behavior.

## Step 3: Item

### Identity

1. Open the `Item: First` Anatomy group.
2. Default first Item expected values:
   - `Ref target`: `article`
   - `Composition`: `default`
   - Attributes tag: `article`
   - Attributes: `tabindex="0"`
   - ARIA: `role="article"`
   - ARIA: `aria-posinset="1"`
   - ARIA: `aria-setsize="3"`
   - Data: `data-slot="feed-item"`
   - Data: `data-position="1"`
   - Data: `data-setsize="3"`
   - Data: no `data-prop-check`

### Props / Slots

1. In `Props`, enable `Prop Check`.
2. Expected first Item Data:
   - `data-slot="feed-item"`
   - `data-prop-check="item"`
   - `data-position="1"`
   - `data-setsize="3"`
3. Disable `Prop Check`.
4. In `Props`, enable `Item Slot`.
5. Expected first Item Data:
   - `data-slot="feed-item-custom"`
6. Disable `Item Slot`.

### Composition

1. In `Composition`, set `Item` to `As Child`.
2. Expected first Item values:
   - `Composition`: `asChild`
   - `Ref target`: `article`
   - Attributes tag: `article`
   - ARIA: `role="article"`
   - Data: `data-slot="feed-item"`
   - no nested article wrapper around the child article
3. In `Composition`, set `Item` to `Render`.
4. Expected first Item values:
   - `Composition`: `render`
   - `Ref target`: `section`
   - Attributes tag: `section`
   - ARIA: `role="article"`
   - Data: `data-slot="feed-item"`
5. Set `Item` back to `Default`.

### Interaction

1. Click the first article body.
2. Expected Inspector `Selected` shows the clicked element inside `Item: First`.
3. Click the first article `Open` button.
4. Expected Logs contains `opened deploy`.

Pass condition: Item identity, ARIA, data attributes, prop pass-through, custom slot, ref target, composition, and article-local interaction are verified without checking Root state.

## Step 4: Source

1. Switch Canvas to `Source`.
2. With defaults, expect Source to include:
   - `<Feed.Root setSize={3}>`
   - `<Feed.Item index={0}>`
3. In `State`, enable `Busy`.
4. Expected Source includes `busy` on `Feed.Root`.
5. In `State`, set `Set size` to `Unknown`.
6. Expected Source includes `setSize={"unknown"}`.
7. In `State`, set `Position` to `Position`.
8. Expected Source includes `setSize={100}` and `<Feed.Item position={11}>`.
9. In `State`, enable `Item set size`.
10. Expected Source includes `setSize={10}` on `Feed.Item`.
11. In `Keyboard`, enable `Prevent key handling`.
12. Expected Source includes `onKeyDown={(event) => event.preventDefault()}`.
13. In `Composition`, set `Root` to `As Child`.
14. Expected Source includes `asChild` on `Feed.Root` and a child `<section>`.
15. In `Composition`, set `Root` to `Render`.
16. Expected Source includes `render={(props) => (` on `Feed.Root`.
17. In `Composition`, set `Item` to `As Child`.
18. Expected Source includes `asChild` on `Feed.Item`.
19. In `Composition`, set `Item` to `Render`.
20. Expected Source includes `render={(props) => (` on `Feed.Item`.
21. In `Props`, enable `Prop Check`, `Root Slot`, and `Item Slot`.
22. Expected Source includes:
   - `data-prop-check="root"`
   - `data-prop-check="item"`
   - `data-slot="feed-custom"`
   - `data-slot="feed-item-custom"`
23. Restore defaults:
   - `Busy`: off
   - `Set size`: `Known`
   - `Position`: `Index`
   - `Item set size`: off
   - `Prevent key handling`: off
   - `Root`: `Default`
   - `Item`: `Default`
   - `Prop Check`: off
   - `Root Slot`: off
   - `Item Slot`: off
24. Switch Canvas back to `Canvas`.

Pass condition: Source tracks state, keyboard prevention, composition, prop-check markers, and custom slots using public Atom JSX only.

## Step 5: Inspector / Logs

1. Click the `Feed.Root` area outside article text.
2. Expected Inspector `Selected` shows raw groups for the selected feed element:
   - `Attributes`
   - `ARIA`
   - `Data`
3. Focus the first article.
4. Expected Inspector `Focused` shows:
   - Attributes tag for the focused Item
   - ARIA: `role="article"`
   - ARIA: `aria-posinset="1"`
   - Data: `data-slot="feed-item"`
5. Press `PageDown`.
6. Expected focus moves to the second article.
7. Expected Logs contains `feed keydown PageDown`.
8. Press `PageUp`.
9. Expected focus moves back to the first article.
10. Expected Logs contains `feed keydown PageUp`.
11. Click `Clear logs`.
12. Expected Logs tab row area is empty and the log count is `0`.

Pass condition: Selected, Focused, and Logs provide live evidence for Feed elements and keyboard events.

## Step 6: Nested / Portal / Focus Behavior

1. Focus the first article.
2. Press `PageDown`.
3. Expected focus moves to the next feed article and does not move to the nested `Open` button.
4. Press `PageDown` until the last article is focused.
5. Expected focus remains on the last article when pressing `PageDown` again.
6. Press `PageUp` until the first article is focused.
7. Expected focus remains on the first article when pressing `PageUp` again.
8. Focus any feed article.
9. Press `Ctrl+Home` on Windows/Linux or `Cmd+Home` on macOS.
10. Expected focus moves to `Before feed`.
11. Focus any feed article.
12. Press `Ctrl+End` on Windows/Linux or `Cmd+End` on macOS.
13. Expected focus moves to `After feed`.
14. Focus the first article.
15. In `Keyboard`, enable `Prevent key handling`.
16. Press `PageDown`.
17. Expected focus stays on the first article.
18. Expected Logs contains `feed keydown PageDown`.
19. Disable `Prevent key handling`.

Pass condition: Feed keyboard behavior follows the documented feed pattern, focus exits before/after the feed with modifier keys, and consumer `preventDefault` blocks Atom key handling.

## Step 7: Workbook Cleanup / Rewrite Notes

1. Do not run this step as manual UI testing.
2. After all manual testing steps pass, update workbook rows for implemented and tested Feed coverage.
3. Review likely workbook cleanup items:
   - Row 12 is partly architectural; keep only if verified through Source and Canvas boundaries.
   - Row 51 should say `Ctrl/Cmd+End behavior`, not plain `End behavior`.
   - Row 52 should say `Ctrl/Cmd+Home behavior`, not plain `Home behavior`.
   - Row 54 `Arrow key navigation follows documented orientation` is not applicable to Feed.
   - Row 55 duplicates Home/End coverage and should be removed or merged.
   - Row 56 `disabled items` is not applicable to Feed.
   - Row 57 `typeahead/search behavior` is not applicable to Feed.
   - Row 58 `roving focus or active descendant state` is not applicable; Feed uses focusable articles.
4. Keep workbook updates separate from this manual test execution until every step passes or any issues are triaged.

Pass condition: Cleanup notes are ready for workbook maintenance, with no workbook file changes made during manual testing.
