import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Progress,
  ProgressIndicator,
  ProgressRoot,
  getProgressState,
  clampProgressValue,
  getProgressPercent,
  useProgress,
} from "../../dist/index.js";

test("ProgressRoot renders determinate progressbar state with actual value", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Progress.Root,
      {
        value: 3,
        max: 10,
        "aria-label": "Upload progress",
      },
      React.createElement(Progress.Indicator, null),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="10"/);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /aria-label="Upload progress"/);
  assert.match(html, /data-state="loading"/);
  assert.match(html, /data-value="3"/);
  assert.match(html, /data-max="10"/);
  assert.match(html, /data-percent="30"/);
  assert.match(html, /<div aria-hidden="true" data-state="loading" data-slot="progress-indicator" data-min="0" data-max="10" data-value="3" data-percent="30"><\/div>/);
  assert.equal(Progress.Root, ProgressRoot);
  assert.equal(Progress.Indicator, ProgressIndicator);
});

test("Progress supports uncontrolled defaults and explicit unknown values", () => {
  const defaultHtml = renderToStaticMarkup(React.createElement(Progress.Root, { defaultValue: 25, "aria-label": "Upload" }));
  assert.match(defaultHtml, /aria-valuenow="25"/);
  const unknownHtml = renderToStaticMarkup(React.createElement(Progress.Root, { value: null, defaultValue: 25, "aria-label": "Upload" }));
  assert.doesNotMatch(unknownHtml, /aria-valuenow/);
  const invalidHtml = renderToStaticMarkup(React.createElement(Progress.Root, { value: NaN, min: NaN }));
  assert.doesNotMatch(invalidHtml, /NaN|Infinity|aria-valuenow/);
});

test("Progress external controller preserves context, IDs and one semantic owner", () => {
  function Example() {
    const progress = useProgress({ defaultValue: 5, max: 10, ids: { root: "upload", label: "upload-name" } });
    return React.createElement(Progress.RootProvider, {
      value: progress, "aria-labelledby": progress.ids.label, asChild: true,
      "aria-valuetext": "explicit", getValueLabel: () => "callback",
    }, React.createElement("section", null,
      React.createElement("span", { id: progress.ids.label }, "Upload"),
      React.createElement(Progress.Context, null, (state) => React.createElement("span", null, `${state.percent}%`)),
      React.createElement(Progress.Indicator)));
  }
  const html = renderToStaticMarkup(React.createElement(Example));
  assert.match(html, /^<section/);
  assert.match(html, /id="upload"/);
  assert.match(html, /aria-labelledby="upload-name"/);
  assert.match(html, /aria-valuetext="explicit"/);
  assert.equal((html.match(/role="progressbar"/g) || []).length, 1);
  assert.match(html, /50%/);
  assert.doesNotMatch(html, /aria-live|callback/);
});

test("Progress controller updates, clamps and respects controlled state and refs", async () => {
  const { JSDOM } = await import("jsdom");
  const { createRoot } = await import("react-dom/client");
  const dom = new JSDOM('<div id="root"></div>');
  const previous = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(document.getElementById("root"));
  let controller;
  const events = [];
  const ref = React.createRef();
  function Example({ value } = {}) {
    controller = useProgress({ value, defaultValue: 20, onValueChange: (event) => events.push(event) });
    return React.createElement(Progress.RootProvider, { value: controller, ref, "aria-label": "Upload" });
  }
  try {
    await React.act(async () => root.render(React.createElement(Example)));
    const id = ref.current.id;
    await React.act(async () => {
      controller.setValue(50);
      controller.setValue(20);
    });
    assert.equal(controller.value, 20, "last batched request wins, including a return to the rendered value");
    assert.deepEqual(events.map(event => event.value), [50, 20]);
    await React.act(async () => {
      controller.setValue(20);
      controller.setValue(20);
    });
    assert.equal(events.length, 2, "normalized no-op requests stay silent");
    await React.act(async () => controller.setValue(200));
    assert.equal(controller.value, 100);
    assert.equal(ref.current.getAttribute("aria-valuenow"), "100");
    assert.equal(ref.current.id, id);
    assert.equal(events.at(-1).percent, 100);
    await React.act(async () => controller.setValue(NaN));
    assert.equal(controller.value, null);
    assert.equal(ref.current.hasAttribute("aria-valuenow"), false);
    await React.act(async () => root.render(React.createElement(Example, { value: 10 })));
    await React.act(async () => controller.setValue(30));
    assert.equal(controller.value, 10);
    assert.equal(events.at(-1).value, 30);
  } finally {
    await React.act(async () => root.unmount());
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
    dom.window.close();
  }
});

test("indeterminate composition clears authored numeric ARIA and data values", () => {
  const html = renderToStaticMarkup(React.createElement(Progress.Root, { value: null, asChild: true },
    React.createElement("section", { "aria-label": "Upload", "aria-valuenow": 40, "data-value": 40, "data-percent": 40 },
      React.createElement(Progress.Indicator, { asChild: true },
        React.createElement("span", { "data-value": 40, "data-percent": 40 })))));
  assert.doesNotMatch(html, /aria-valuenow=|data-value=|data-percent=/);
  assert.match(html, /data-state="indeterminate"/);
});

test("Progress never exposes non-finite state or percentages", () => {
  assert.equal(getProgressState({ value: NaN }).isIndeterminate, true);
  assert.equal(getProgressState({ value: 40, min: NaN }).percent, 40);
  assert.equal(getProgressState({ value: Infinity }).value, 100);
  assert.equal(getProgressState({ value: -Infinity }).value, 0);
  for (const min of [NaN, Infinity, -Infinity, -Number.MAX_VALUE, Number.MAX_VALUE, 0]) {
    for (const max of [NaN, Infinity, -Infinity, Number.MAX_VALUE, 0, 100]) {
      const state = getProgressState({ value: 40, min, max });
      assert.ok(Number.isFinite(state.min));
      assert.ok(Number.isFinite(state.max));
      assert.ok(state.max > state.min);
      assert.ok(Number.isFinite(state.percent));
      assert.ok(state.percent >= 0 && state.percent <= 100);
      assert.ok(Number.isFinite(clampProgressValue(NaN, min, max)));
      assert.ok(Number.isFinite(getProgressPercent(NaN, min, max)));
    }
  }
  assert.equal(getProgressState({ value: 0, min: -Number.MAX_VALUE, max: Number.MAX_VALUE }).percent, 50);
});

test("ProgressRoot omits aria-valuenow for indeterminate progress", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ProgressRoot,
      {
        value: null,
        "aria-label": "Loading",
      },
      React.createElement(ProgressIndicator, null),
    ),
  );

  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.doesNotMatch(html, /aria-valuenow=/);
  assert.match(html, /data-state="indeterminate"/);
  assert.doesNotMatch(html, /data-value=/);
  assert.doesNotMatch(html, /data-percent=/);
  assert.match(html, /data-slot="progress-indicator"/);
});

test("Progress helpers clamp values and report complete state", () => {
  assert.deepEqual(getProgressState({ value: 125, min: 0, max: 100 }), {
    isIndeterminate: false,
    value: 100,
    min: 0,
    max: 100,
    percent: 100,
    dataState: "complete",
  });
});

test("ProgressRoot passes value, min, and max to getValueLabel in utility order", () => {
  const html = renderToStaticMarkup(
    React.createElement(ProgressRoot, {
      value: 3,
      min: 1,
      max: 10,
      getValueLabel: (value, min, max) => `${value} from ${min} to ${max}`,
    }),
  );

  assert.match(html, /aria-valuetext="3 from 1 to 10"/);
});

test("Progress helpers normalize invalid ranges before exposing ARIA state", () => {
  assert.deepEqual(getProgressState({ value: 125, min: 10, max: 5 }), {
    isIndeterminate: false,
    value: 110,
    min: 10,
    max: 110,
    percent: 100,
    dataState: "complete",
  });
});
