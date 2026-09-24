import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Direction,
  Slider,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderControl,
  SliderLabel,
  SliderValueText,
  SliderMarker,
  SliderMarkerGroup,
  SliderMarkerIndicator,
  SliderMarkerLabel,
  SliderDraggingIndicator,
  SliderHiddenInput,
  applySliderCollision,
  valueToPercent,
} from "../../dist/index.js";

test("Slider namespace exposes compound parts", () => {
  assert.equal(Slider.Root, SliderRoot);
  assert.equal(Slider.Track, SliderTrack);
  assert.equal(Slider.Range, SliderRange);
  assert.equal(Slider.Thumb, SliderThumb);
  assert.equal(Slider.Control, SliderControl);
  assert.equal(Slider.Label, SliderLabel);
  assert.equal(Slider.ValueText, SliderValueText);
  assert.equal(Slider.Marker, SliderMarker);
  assert.equal(Slider.MarkerGroup, SliderMarkerGroup);
  assert.equal(Slider.MarkerIndicator, SliderMarkerIndicator);
  assert.equal(Slider.MarkerLabel, SliderMarkerLabel);
  assert.equal(Slider.DraggingIndicator, SliderDraggingIndicator);
  assert.equal(Slider.HiddenInput, SliderHiddenInput);
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
        "aria-label": "Price",
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

test("Slider percent geometry is normalized for data attributes", () => {
  assert.equal(valueToPercent(55.00000000000001, 0, 100), 55);

  const html = renderToStaticMarkup(
    React.createElement(
      SliderRoot,
      {
        value: 55.00000000000001,
        min: 0,
        max: 100,
        "aria-label": "Volume",
      },
      React.createElement(
        SliderTrack,
        null,
        React.createElement(SliderRange, null),
      ),
      React.createElement(SliderThumb, null),
    ),
  );

  assert.match(html, /data-value="55.00000000000001"/);
  assert.match(html, /data-percent="55"/);
  assert.match(html, /inset-inline-start:55%/);
  assert.doesNotMatch(html, /55\.00000000000001%/);
  assert.doesNotMatch(html, /data-percent="55\.00000000000001"/);
});

test("Slider range thumbs expose their effective dependent bounds", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SliderRoot,
      {
        value: [25, 75],
        min: 0,
        max: 100,
        step: 1,
        minStepsBetweenThumbs: 5,
        "aria-label": "Price",
      },
      React.createElement(SliderThumb, { index: 0 }),
      React.createElement(SliderThumb, { index: 1 }),
    ),
  );

  assert.match(html, /aria-valuenow="25" aria-valuemin="0" aria-valuemax="70"/);
  assert.match(html, /aria-valuenow="75" aria-valuemin="30" aria-valuemax="100"/);
});

test("Slider preserves scroll, reverts cancellation, and commits capture loss", async () => {
  const controllerSource = await readFile(
    new URL("src/primitives/slider/useSlider.ts", packageRoot),
    "utf8",
  );
  const trackSource = await readFile(
    new URL("src/primitives/slider/SliderTrack.tsx", packageRoot),
    "utf8",
  );

  assert.match(controllerSource, /disabled \|\| readOnly \|\| pointerSessionRef\.current \|\| event\.button !== 0/);
  assert.match(controllerSource, /currentValues: \[\.\.\.values\]/);
  assert.match(controllerSource, /onValueCommit\?\.\(toOutput\(session\.currentValues\)\)/);
  assert.match(controllerSource, /setValues\(session\.initialValues\)/);
  assert.match(trackSource, /touchAction: context\.orientation === "horizontal" \? "pan-y" : "pan-x"/);
  assert.match(trackSource, /onLostPointerCapture: composeEventHandlers/);
  assert.match(trackSource, /onLostPointerCapture,[\s\S]*context\.handlePointerUp/);
  assert.match(controllerSource, /onLostPointerCapture: handlePointerUp/);
  assert.doesNotMatch(controllerSource, /onLostPointerCapture: handlePointerCancel/);
  assert.doesNotMatch(controllerSource, /onPointerCancel: handlePointerUp/);
});

test("Slider preserves explicit thumb names and root labelledby", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Slider.Root,
      { value: [20, 80], "aria-labelledby": "price-label", "aria-describedby": "price-help" },
      React.createElement(Slider.Thumb, { index: 0, "aria-label": "Minimum price", "aria-describedby": "minimum-help" }),
      React.createElement(Slider.Thumb, { index: 1, "aria-labelledby": "maximum-label" }),
    ),
  );
  assert.match(html, /aria-label="Minimum price"/);
  assert.doesNotMatch(html, /aria-label="Minimum price 1"/);
  assert.match(html, /aria-describedby="price-help minimum-help"/);
  assert.match(html, /aria-labelledby="maximum-label"/);
});

test("Slider renders richer anatomy, centered origin, and explicit inputs", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Slider.Root,
      { value: -20, min: -100, max: 100, origin: "center", name: "offset", hiddenInputMode: "explicit" },
      React.createElement(Slider.Label, null, "Offset"),
      React.createElement(Slider.ValueText, null),
      React.createElement(
        Slider.Control,
        null,
        React.createElement(Slider.Track, null, React.createElement(Slider.Range)),
        React.createElement(Slider.Thumb),
        React.createElement(Slider.DraggingIndicator),
      ),
      React.createElement(Slider.HiddenInput),
    ),
  );
  assert.match(html, /data-origin="center"/);
  assert.match(html, /data-start="40" data-end="50"/);
  assert.match(html, /data-slot="slider-label"/);
  assert.match(html, /data-slot="slider-value-text"[^>]*>-20</);
  assert.equal((html.match(/type="hidden"/g) ?? []).length, 1);
});

test("Slider collision policies preserve ordering and active identity", () => {
  assert.deepEqual(
    applySliderCollision([20, 40, 60], 55, 0, "none", 0, 100, 1, 5),
    { values: [35, 40, 60], activeIndex: 0 },
  );
  assert.deepEqual(
    applySliderCollision([20, 40, 60], 55, 0, "push", 0, 100, 1, 5),
    { values: [55, 60, 65], activeIndex: 0 },
  );
  assert.deepEqual(
    applySliderCollision([20, 40, 60], 55, 0, "swap", 0, 100, 1, 0),
    { values: [40, 55, 60], activeIndex: 1 },
  );
  assert.deepEqual(
    applySliderCollision([80, 90, 100], 95, 0, "push", 0, 100, 1, 5),
    { values: [90, 95, 100], activeIndex: 0 },
  );
});

test("Slider controller source implements Shift+Arrow and contained geometry", async () => {
  const source = await readFile(new URL("src/primitives/slider/useSlider.ts", packageRoot), "utf8");
  assert.match(source, /event\.shiftKey \? largeStep : config\.step/);
  assert.match(source, /thumbAlignment === "contain"/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /finishSession\("cancel"\)/);
  assert.match(source, /thumbNodesRef\.current\.get\(result\.activeIndex\)\?\.focus\(\{ preventScroll: true \}\)/);
});

test("Slider scalar fill reaches rail boundaries with explicit visible containment", () => {
  const html = renderToStaticMarkup(React.createElement(Slider.Root, {
    defaultValue: 100, thumbSize: {width:20, height:20}, "aria-label":"Volume",
  }, React.createElement(Slider.Track, null, React.createElement(Slider.Range)), React.createElement(Slider.Thumb)));
  assert.match(html, /inset-inline-start:0%/);
  assert.match(html, /inset-inline-end:calc\(100% - 100%\)/);
  assert.match(html, /calc\(10px \+ \(100% - 20px\) \* 1\)/);
});

test("Slider consumes Direction.Provider for horizontal RTL behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(
        SliderRoot,
        {
          value: 25,
          min: 0,
          max: 100,
          "aria-label": "Volume",
        },
        React.createElement(
          SliderTrack,
          null,
          React.createElement(SliderRange, null),
        ),
        React.createElement(SliderThumb, null),
      ),
    ),
  );

  assert.match(html, /dir="rtl"/);
  assert.match(html, /aria-valuenow="25"/);
  assert.match(html, /data-percent="25"/);
  assert.match(html, /inset-inline-start:25%/);
});
