import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Rating,
  RatingItem,
  RatingRoot,
  getRatingItemState,
} from "../../dist/index.js";

test("RatingRoot renders slider semantics and fractional item fill", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Rating.Root,
      {
        value: 4.6,
        max: 5,
        step: 0.1,
        name: "rating",
        form: "review",
        "aria-label": "Rating",
      },
      [1, 2, 3, 4, 5].map((itemValue) =>
        React.createElement(Rating.Item, { key: itemValue, value: itemValue }, "★"),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="slider"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="5"/);
  assert.match(html, /aria-valuenow="4.6"/);
  assert.match(html, /aria-valuetext="4.6 out of 5"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="rating"/);
  assert.match(html, /data-value="4.6"/);
  assert.match(html, /data-step="0.1"/);
  assert.match(html, /data-value="4" data-fill="100" data-state="full"/);
  assert.match(html, /data-value="5" data-fill="60" data-state="partial"/);
  assert.match(html, /<input type="hidden"/);
  assert.match(html, /form="review"/);
  assert.match(html, /name="rating"/);
  assert.match(html, /value="4.6"/);
  assert.equal(Rating.Root, RatingRoot);
  assert.equal(Rating.Item, RatingItem);
});

test("RatingRoot exposes disabled readonly invalid and required state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RatingRoot,
      {
        value: 2,
        disabled: true,
        readOnly: true,
        invalid: true,
        required: true,
        name: "rating",
      },
      React.createElement(RatingItem, { value: 1 }, "1"),
    ),
  );

  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-required=""/);
  assert.match(html, /<input type="hidden"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /name="rating"/);
  assert.match(html, /value="2"/);
});

test("Rating source keeps pointer capture and clear behavior stable", async () => {
  const itemSource = await readFile(
    new URL("src/primitives/rating/RatingItem.tsx", packageRoot),
    "utf8",
  );
  const rootSource = await readFile(
    new URL("src/primitives/rating/RatingRoot.tsx", packageRoot),
    "utf8",
  );
  const indexSource = await readFile(
    new URL("src/primitives/rating/index.ts", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /tabIndex: tabIndex \?\? 0/);
  assert.match(rootSource, /Math\.min\(/);
  assert.match(rootSource, /step \* 10/);
  assert.match(rootSource, /step \* Math\.ceil\(\(range\.max - range\.min\) \/ 2 \/ step\)/);
  assert.match(itemSource, /setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(itemSource, /releasePointerCapture\?\.\(event\.pointerId\)/);
  assert.match(itemSource, /setValue\(value\)/);
  assert.match(itemSource, /interaction\.initialValue > min/);
  assert.match(itemSource, /value === interaction\.initialValue/);
  assert.match(itemSource, /setValue\(min\)/);
  assert.doesNotMatch(itemSource, /snappedPointerValue/);
  assert.doesNotMatch(itemSource, /\[context, /);
  assert.match(itemSource, /onPointerCancel: composeEventHandlers/);
  assert.doesNotMatch(indexSource, /^"use client";/);
});

test("Rating helpers report item fill states", () => {
  assert.deepEqual(getRatingItemState(4.6, 5), {
    fill: 60,
    dataState: "partial",
  });
  assert.deepEqual(getRatingItemState(5, 5), {
    fill: 100,
    dataState: "full",
  });
  assert.deepEqual(getRatingItemState(3, 5), {
    fill: 0,
    dataState: "empty",
  });
});
