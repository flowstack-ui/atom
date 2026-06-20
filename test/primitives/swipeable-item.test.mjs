import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  SwipeableItem,
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemRoot,
  clampSwipeableItemOffset,
  getSwipeableItemOffsetForSide,
  getSwipeableItemSideForOffset,
  getSwipeableItemSideFromKey,
} from "../../dist/index.js";

test("SwipeableItem compound parts expose headless swipe state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwipeableItem.Root,
      {
        defaultOpenSide: "start",
        threshold: 0.5,
        "data-testid": "message-row",
      },
      React.createElement(
        SwipeableItem.Actions,
        { side: "start" },
        React.createElement("button", { type: "button" }, "Archive"),
      ),
      React.createElement(
        SwipeableItem.Content,
        null,
        React.createElement("span", null, "Message"),
      ),
      React.createElement(
        SwipeableItem.Actions,
        { side: "end" },
        React.createElement("button", { type: "button" }, "Delete"),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /data-testid="message-row"/);
  assert.match(html, /data-slot="swipeable-item"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /data-side="start"/);
  assert.match(html, /--atom-swipeable-item-offset:0px/);
  assert.match(html, /--atom-swipeable-item-start-size:0px/);
  assert.match(html, /data-slot="swipeable-item-content"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="swipeable-item-actions" data-side="start" data-state="open" role="group" aria-label="start actions"/);
  assert.match(html, /data-slot="swipeable-item-actions" data-side="end" data-state="closed" role="group" aria-label="end actions" aria-hidden="true" inert=""/);
  assert.equal(SwipeableItem.Root, SwipeableItemRoot);
  assert.equal(SwipeableItem.Content, SwipeableItemContent);
  assert.equal(SwipeableItem.Actions, SwipeableItemActions);
});

test("SwipeableItem utilities resolve direction-aware sides and offsets", () => {
  assert.equal(getSwipeableItemOffsetForSide("start", "ltr", 64, 96), 64);
  assert.equal(getSwipeableItemOffsetForSide("end", "ltr", 64, 96), -96);
  assert.equal(getSwipeableItemOffsetForSide("start", "rtl", 64, 96), -64);
  assert.equal(getSwipeableItemOffsetForSide("end", "rtl", 64, 96), 96);
  assert.equal(getSwipeableItemSideForOffset(12, "ltr"), "start");
  assert.equal(getSwipeableItemSideForOffset(-12, "ltr"), "end");
  assert.equal(getSwipeableItemSideForOffset(12, "rtl"), "end");
  assert.equal(getSwipeableItemSideForOffset(-12, "rtl"), "start");
  assert.equal(clampSwipeableItemOffset(200, "ltr", 64, 96), 64);
  assert.equal(clampSwipeableItemOffset(-200, "ltr", 64, 96), -96);
  assert.equal(getSwipeableItemSideFromKey("ArrowLeft", "ltr"), "end");
  assert.equal(getSwipeableItemSideFromKey("ArrowRight", "rtl"), "end");
});

test("SwipeableItem source handles pointer capture and keyboard close", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/swipeable-item/SwipeableItemRoot.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/swipeable-item/SwipeableItemContent.tsx", packageRoot),
    "utf8",
  );
  const actionsSource = await readFile(
    new URL("src/primitives/swipeable-item/SwipeableItemActions.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /onFullSwipe/);
  assert.match(rootSource, /fullSwipeThreshold = 0\.6/);
  assert.match(contentSource, /setPointerCapture\(event\.pointerId\)/);
  assert.match(contentSource, /hasPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(contentSource, /releasePointerCapture\(event\.pointerId\)/);
  assert.match(contentSource, /contentWidth \* fullSwipeThreshold/);
  assert.match(contentSource, /onFullSwipe\?\.\(side\)/);
  assert.match(contentSource, /if \(pointerStateRef\.current !== null\) return/);
  assert.match(contentSource, /setOffset\(pointerState\.baseOffset\)/);
  assert.match(contentSource, /const handleLostPointerCapture = useCallback/);
  assert.match(contentSource, /event\.key === "Escape"/);
  assert.match(contentSource, /getSwipeableItemSideFromKey\(event\.key, dir\)/);
  assert.doesNotMatch(contentSource, /\[ctx\]/);
  assert.match(actionsSource, /ResizeObserver/);
  assert.match(actionsSource, /const \[actionsElement, setActionsElement\] = useState/);
  assert.match(actionsSource, /composeRefs\(setActionsRef, ref\)/);
  assert.match(actionsSource, /inert: isOpen \? undefined : true/);
});
