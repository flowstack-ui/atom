import { test, assert, React } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { Slider, useSlider } from "../../dist/slider.js";

test("Slider root and control refs remain attached across value renders", async () => {
  const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
  const keys = ["window", "document", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = keys.map(key => globalThis[key]);
  keys.forEach(key => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
  const root = createRoot(document.getElementById("app"));
  const roots = [], controls = [];
  const rootRef = node => { roots.push(node); };
  const controlRef = node => { controls.push(node); };
  const render = value => React.createElement(Slider.Root, { value, ref: rootRef, "aria-label": "Volume" },
    React.createElement(Slider.Control, { ref: controlRef },
      React.createElement(Slider.Track, null, React.createElement(Slider.Thumb))));
  let unmounted = false;
  try {
    await React.act(async () => root.render(render(40)));
    await React.act(async () => root.render(render(85)));
    assert.equal(roots.length, 1, "root ref must not detach on value updates");
    assert.equal(controls.length, 1, "control ref must not detach on value updates");
    assert.equal(document.querySelector('[role="slider"]').getAttribute("aria-valuenow"), "85");
    await React.act(async () => root.unmount());
    unmounted = true;
    assert.equal(roots.at(-1), null);
    assert.equal(controls.at(-1), null);
  } finally {
    if (!unmounted) await React.act(async () => root.unmount());
    keys.forEach((key, index) => { if (previous[index] === undefined) delete globalThis[key]; else globalThis[key] = previous[index]; });
    dom.window.close();
  }
});

for (const accepts of [true, false]) {
  test(`Slider controlled pointer commit follows an owner that ${accepts ? "accepts" : "rejects"} changes`, async () => {
    const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
    const keys = ["window", "document", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"];
    const previous = keys.map(key => globalThis[key]);
    keys.forEach(key => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
    const root = createRoot(document.getElementById("app"));
    let controller;
    const commits = [];
    function Fixture() {
      const [value, setValue] = React.useState(40);
      controller = useSlider({ value, onValueChange: next => { if (accepts) setValue(next); }, onValueCommit: next => commits.push(next), thumbSize: { width: 0, height: 0 } });
      return React.createElement(Slider.RootProvider, { value: controller }, React.createElement(Slider.Control));
    }
    try {
      await React.act(async () => root.render(React.createElement(Fixture)));
      const control = document.querySelector('[data-slot="slider-control"]');
      control.getBoundingClientRect = () => ({ left: 0, right: 100, top: 0, bottom: 10, width: 100, height: 10 });
      const event = { pointerId: 1, button: 0, isPrimary: true, currentTarget: control, clientX: 80, clientY: 5, preventDefault() {} };
      await React.act(async () => controller.handleTrackPointerDown(event));
      await React.act(async () => controller.handlePointerUp({ ...event, type: "pointerup", clientX: 90 }));
      assert.deepEqual(commits, accepts ? [90] : []);
      assert.equal(controller.values[0], accepts ? 90 : 40);
    } finally {
      await React.act(async () => root.unmount());
      keys.forEach((key, index) => { if (previous[index] === undefined) delete globalThis[key]; else globalThis[key] = previous[index]; });
      dom.window.close();
    }
  });
}
