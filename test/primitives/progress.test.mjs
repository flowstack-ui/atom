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
