import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Slider,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "../../dist/index.js";

test("Slider namespace exposes compound parts", () => {
  assert.equal(Slider.Root, SliderRoot);
  assert.equal(Slider.Track, SliderTrack);
  assert.equal(Slider.Range, SliderRange);
  assert.equal(Slider.Thumb, SliderThumb);
});

test("Slider compound parts render track range and thumbs", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SliderRoot,
      {
        defaultValue: [25, 75],
        min: 0,
        max: 100,
        name: "price",
        form: "filters-form",
        disabled: true,
        ariaLabel: "Price",
        className: "slider-class",
        "data-slot": "price-slider",
      },
      React.createElement(
        SliderTrack,
        { className: "track-class" },
        React.createElement(SliderRange, { className: "range-class" }),
      ),
      React.createElement(SliderThumb, {
        index: 0,
        className: "thumb-one",
      }),
      React.createElement(SliderThumb, {
        index: 1,
        className: "thumb-two",
      }),
    ),
  );

  assert.match(html, /data-slot="slider-track"/);
  assert.match(html, /data-slot="price-slider"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /class="slider-class"/);
  assert.match(html, /class="track-class"/);
  assert.match(html, /data-slot="slider-range"/);
  assert.match(html, /data-start="25"/);
  assert.match(html, /data-end="75"/);
  assert.match(html, /inset-inline-start:25%/);
  assert.match(html, /inset-inline-end:25%/);
  assert.match(html, /data-slot="slider-thumb"/);
  assert.match(html, /aria-valuenow="25"/);
  assert.match(html, /aria-valuenow="75"/);
  assert.match(html, /aria-label="Price 1"/);
  assert.match(html, /aria-label="Price 2"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-percent="25"/);
  assert.match(html, /data-percent="75"/);
  assert.match(html, /inset-inline-start:25%/);
  assert.match(html, /inset-inline-start:75%/);
  assert.match(
    html,
    /<input(?=[^>]*type="hidden")(?=[^>]*disabled="")(?=[^>]*name="price\[0\]")(?=[^>]*form="filters-form")(?=[^>]*value="25")[^>]*>/,
  );
  assert.match(
    html,
    /<input(?=[^>]*type="hidden")(?=[^>]*disabled="")(?=[^>]*name="price\[1\]")(?=[^>]*form="filters-form")(?=[^>]*value="75")[^>]*>/,
  );
});
