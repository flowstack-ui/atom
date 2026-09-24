import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useFormReset } from "../../dist/_internal/hooks/useFormReset.js";

test("deferred reset uses the current callback and cancels on prevention, reassociation and unmount", async () => {
  const dom = new JSDOM('<form id="a"></form><form id="b"></form><div id="root"></div>');
  const keys = ["window", "document", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = keys.map(key => globalThis[key]);
  keys.forEach(key => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
  const root = createRoot(document.getElementById("root"));
  const calls = [];
  function Fixture({ form = "a", label = "first", visible = true }) {
    const ref = React.useRef(null);
    useFormReset(ref, form, false, () => calls.push(label));
    return visible ? React.createElement("input", { ref, form }) : null;
  }
  const tick = () => act(async () => { await new Promise(resolve => window.setTimeout(resolve, 0)); });
  let unmounted = false;
  try {
    act(() => root.render(React.createElement(Fixture, { visible: false })));
    act(() => root.render(React.createElement(Fixture)));
    const form = document.getElementById("a");
    act(() => { form.reset(); root.render(React.createElement(Fixture, { label: "current" })); });
    await tick();
    assert.deepEqual(calls, ["current"]);
    form.addEventListener("reset", event => event.preventDefault(), { once: true });
    act(() => form.reset());
    await tick();
    assert.equal(calls.length, 1);
    act(() => { form.reset(); root.render(React.createElement(Fixture, { form: "b" })); });
    await tick();
    assert.equal(calls.length, 1);
    act(() => { document.getElementById("b").reset(); root.unmount(); });
    unmounted = true;
    await tick();
    assert.equal(calls.length, 1);
  } finally {
    if (!unmounted) act(() => root.unmount());
    keys.forEach((key, index) => { if (previous[index] === undefined) delete globalThis[key]; else globalThis[key] = previous[index]; });
    dom.window.close();
  }
});
