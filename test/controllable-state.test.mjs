import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { useControllableState, useCheckbox, useCheckboxGroup } from "../dist/index.js";

test("batched state requests compose when uncontrolled and retain controlled authority", async () => {
  const dom = new JSDOM("<div id='root'></div>");
  const previous = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(document.getElementById("root"));
  let state, checkbox, group;
  const requests = [];
  function Probe({ controlled = false }) {
    state = useControllableState({ defaultValue: 0, value: controlled ? 10 : undefined, onChange: value => requests.push(value) });
    checkbox = useCheckbox();
    group = useCheckboxGroup({ maxSelectedValues: 2, value: controlled ? ["owned"] : undefined });
    return null;
  }
  try {
    await React.act(async () => root.render(React.createElement(Probe)));
    await React.act(async () => { state[1](value => value + 1); state[1](value => value + 1); });
    assert.equal(state[0], 2);
    assert.deepEqual(requests, [1, 2]);
    await React.act(async () => { checkbox.toggle(); checkbox.toggle(); });
    assert.equal(checkbox.checked, false);
    await React.act(async () => { group.setChecked("a", true); group.setChecked("b", true); group.setChecked("c", true); });
    assert.deepEqual(group.value, ["a", "b"]);
    await React.act(async () => { group.toggleValue("a"); group.toggleValue("a"); });
    assert.deepEqual(group.value, ["b", "a"]);
    await React.act(async () => root.render(React.createElement(Probe, { controlled: true })));
    requests.length = 0;
    await React.act(async () => { state[1](value => value + 1); state[1](value => value + 1); group.setChecked("a", true); group.setChecked("b", true); });
    assert.equal(state[0], 10);
    assert.deepEqual(requests, [11, 11]);
    assert.deepEqual(group.value, ["owned"]);
  } finally {
    await React.act(async () => root.unmount());
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
    dom.window.close();
  }
});
