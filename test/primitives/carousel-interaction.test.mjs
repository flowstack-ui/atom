import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Carousel } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://example.test/" });
  const saved = new Map();
  const animationFrames = new Map();
  let nextFrame = 0;
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    FocusEvent: dom.window.FocusEvent,
    IS_REACT_ACT_ENVIRONMENT: true,
    requestAnimationFrame: (callback) => {
      const id = ++nextFrame;
      animationFrames.set(id, setTimeout(() => {
        animationFrames.delete(id);
        callback(performance.now());
      }, 0));
      return id;
    },
    cancelAnimationFrame: (id) => {
      const timeout = animationFrames.get(id);
      if (timeout) clearTimeout(timeout);
      animationFrames.delete(id);
    },
  };

  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};

  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      for (const timeout of animationFrames.values()) clearTimeout(timeout);
      dom.window.close();
      for (const [key, descriptor] of saved) {
        descriptor
          ? Object.defineProperty(globalThis, key, descriptor)
          : delete globalThis[key];
      }
    },
  };
}

function Fixture({ autoPlay = false, onValueChange, loop = true }) {
  return React.createElement(
    Carousel.Root,
    {
      defaultValue: "one",
      defaultAutoPlay: autoPlay,
      interval: 1000,
      loop,
      onValueChange,
      "aria-label": "Featured stories",
    },
    React.createElement(Carousel.RotationControl, null, "Rotation"),
    React.createElement(
      Carousel.Viewport,
      null,
      React.createElement(
        Carousel.Track,
        null,
        React.createElement(Carousel.Slide, { value: "one", label: "First story" }, React.createElement("a", { href: "#one" }, "One")),
        React.createElement(Carousel.Slide, { value: "two", label: "Second story" }, React.createElement("button", null, "Two")),
        React.createElement(Carousel.Slide, { value: "three", label: "Third story" }, "Three"),
      ),
    ),
    React.createElement(Carousel.Previous, null, "Previous"),
    React.createElement(Carousel.Next, null, "Next"),
    React.createElement(
      Carousel.Picker,
      null,
      React.createElement(Carousel.PickerItem, { value: "one" }),
      React.createElement(Carousel.PickerItem, { value: "two" }),
      React.createElement(Carousel.PickerItem, { value: "three" }),
    ),
  );
}

test("Carousel controls select slides and remove inactive content from focus", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, {
      loop: false,
      onValueChange: (value, reason) => changes.push([value, reason]),
    })));

    const carousel = container.querySelector("[data-slot='carousel-root']");
    const slides = [...container.querySelectorAll("[data-slot='carousel-slide']")];
    const previous = container.querySelector("[data-slot='carousel-previous']");
    const next = container.querySelector("[data-slot='carousel-next']");
    assert.equal(carousel.dataset.value, "one");
    assert.equal(previous.disabled, true);
    assert.equal(slides[1].getAttribute("aria-hidden"), "true");
    assert.equal(slides[1].hasAttribute("inert"), true);

    await React.act(async () => next.click());
    assert.equal(carousel.dataset.value, "two");
    assert.equal(slides[0].getAttribute("aria-hidden"), "true");
    assert.equal(slides[1].hasAttribute("aria-hidden"), false);
    assert.deepEqual(changes.at(-1), ["two", "next"]);

    const thirdPicker = container.querySelector("[data-slot='carousel-picker-item'][data-value='three']");
    assert.equal(thirdPicker.getAttribute("aria-label"), "Third story");
    await React.act(async () => thirdPicker.click());
    assert.equal(carousel.dataset.value, "three");
    assert.equal(next.disabled, true);
    assert.equal(thirdPicker.getAttribute("aria-disabled"), "true");
    assert.deepEqual(changes.at(-1), ["three", "picker"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Carousel focus stops requested automatic rotation until explicitly restarted", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(React.createElement(Fixture, { autoPlay: true })));
    const carousel = container.querySelector("[data-slot='carousel-root']");
    const rotation = container.querySelector("[data-slot='carousel-rotation-control']");
    const link = container.querySelector("a");
    assert.equal(carousel.dataset.state, "playing");
    assert.equal(container.querySelector("[data-slot='carousel-viewport']").getAttribute("aria-live"), "off");
    assert.equal(rotation.getAttribute("aria-label"), "Stop slide rotation");

    await React.act(async () => link.focus());
    assert.equal(carousel.dataset.state, "stopped");
    assert.equal(rotation.getAttribute("aria-label"), "Start slide rotation");
    assert.equal(container.querySelector("[data-slot='carousel-viewport']").getAttribute("aria-live"), "polite");

    await React.act(async () => rotation.click());
    assert.equal(carousel.dataset.state, "playing");
    assert.equal(rotation.getAttribute("aria-label"), "Stop slide rotation");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
