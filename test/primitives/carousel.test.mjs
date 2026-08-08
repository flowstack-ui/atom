import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Carousel,
  CarouselNext,
  CarouselPicker,
  CarouselPickerItem,
  CarouselPrevious,
  CarouselRoot,
  CarouselRotationControl,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
  getCarouselAdjacentValue,
  getClosestCarouselValue,
  normalizeCarouselInterval,
} from "../../dist/index.js";

test("Carousel renders the accessible one-active-slide contract", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CarouselRoot,
      { defaultValue: "company", "aria-label": "Company highlights" },
      React.createElement(CarouselRotationControl),
      React.createElement(
        CarouselViewport,
        null,
        React.createElement(
          CarouselTrack,
          null,
          React.createElement(CarouselSlide, { value: "company", label: "Company services" }, "Company"),
          React.createElement(CarouselSlide, { value: "hosting", label: "Managed hosting" }, "Hosting"),
        ),
      ),
      React.createElement(CarouselPrevious),
      React.createElement(CarouselNext),
      React.createElement(
        CarouselPicker,
        null,
        React.createElement(CarouselPickerItem, { value: "company" }),
        React.createElement(CarouselPickerItem, { value: "hosting" }),
      ),
    ),
  );

  assert.match(html, /data-slot="carousel-root"/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Company highlights"/);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /data-state="stopped"/);
  assert.match(html, /data-value="company"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-slot="carousel-track"/);
  assert.equal((html.match(/data-slot="carousel-loop-boundary"/g) ?? []).length, 2);
  assert.match(html, /aria-label="Company services"/);
  assert.match(html, /data-state="active"/);
  assert.match(html, /aria-label="Managed hosting"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /inert=""/);
  assert.match(html, /aria-label="Start slide rotation"/);
  assert.match(html, /aria-label="Previous slide"/);
  assert.match(html, /aria-label="Next slide"/);
  assert.match(html, /role="group" aria-label="Choose slide to display"/);
});

test("Carousel loop boundaries remain available through Track asChild", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CarouselRoot,
      { defaultValue: "one" },
      React.createElement(
        CarouselViewport,
        null,
        React.createElement(
          CarouselTrack,
          { asChild: true },
          React.createElement(
            "section",
            null,
            React.createElement(CarouselSlide, { value: "one" }, "One"),
            React.createElement(CarouselSlide, { value: "two" }, "Two"),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /<section[^>]*data-slot="carousel-track"/);
  assert.equal((html.match(/data-slot="carousel-loop-boundary"/g) ?? []).length, 2);
});

test("Carousel namespace and direct exports expose every public part", () => {
  assert.equal(Carousel.Root, CarouselRoot);
  assert.equal(Carousel.Viewport, CarouselViewport);
  assert.equal(Carousel.Track, CarouselTrack);
  assert.equal(Carousel.Slide, CarouselSlide);
  assert.equal(Carousel.Previous, CarouselPrevious);
  assert.equal(Carousel.Next, CarouselNext);
  assert.equal(Carousel.Picker, CarouselPicker);
  assert.equal(Carousel.PickerItem, CarouselPickerItem);
  assert.equal(Carousel.RotationControl, CarouselRotationControl);
});

test("Carousel adjacent selection supports bounded and looped sequences", () => {
  const values = ["one", "two", "three"];
  assert.equal(getCarouselAdjacentValue(values, "one", "next", false), "two");
  assert.equal(getCarouselAdjacentValue(values, "three", "next", false), null);
  assert.equal(getCarouselAdjacentValue(values, "three", "next", true), "one");
  assert.equal(getCarouselAdjacentValue(values, "one", "previous", true), "three");
  assert.equal(getCarouselAdjacentValue(values, "missing", "next", false), "one");
});

test("Carousel interval normalization rejects invalid and too-fast timing", () => {
  assert.equal(normalizeCarouselInterval(8000), 8000);
  assert.equal(normalizeCarouselInterval(20), 1000);
  assert.equal(normalizeCarouselInterval(Number.NaN), 7000);
});

test("Carousel nearest-slide selection mirrors the physical edge in RTL", () => {
  const viewport = { getBoundingClientRect: () => ({ left: 100, right: 500 }) };
  const slides = [
    { value: "one", element: { getBoundingClientRect: () => ({ left: 90, right: 260 }) } },
    { value: "two", element: { getBoundingClientRect: () => ({ left: 280, right: 495 }) } },
  ];
  assert.equal(getClosestCarouselValue(viewport, slides, "ltr"), "one");
  assert.equal(getClosestCarouselValue(viewport, slides, "rtl"), "two");
});

test("Carousel source keeps layout and visual motion out of Atom", async () => {
  const files = [
    "CarouselRoot.tsx",
    "CarouselViewport.tsx",
    "CarouselTrack.tsx",
    "CarouselSlide.tsx",
  ];
  const sources = await Promise.all(files.map((file) => readFile(
    new URL(`src/primitives/carousel/${file}`, packageRoot),
    "utf8",
  )));
  const source = sources.join("\n");
  assert.doesNotMatch(source, /import\s+["'][^"']+\.css["']/);
  assert.doesNotMatch(source, /scrollSnap|display:\s*["']flex|overflowX/);
});
