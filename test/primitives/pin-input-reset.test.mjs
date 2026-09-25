import assert from "node:assert/strict";
import test from "node:test";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import { PinInput, usePinInput } from "../../dist/pin-input.js";

test("PinInput reset follows a late provider and cancels obsolete form resets", async () => {
  const dom = new JSDOM('<form id="a"></form><form id="b"></form><div id="root"></div>', { pretendToBeVisual: true });
  const names = ["window", "document", "navigator", "Element", "HTMLElement", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const saved = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[name] });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  let api;
  function Fixture({ visible = true, form = "a" }) {
    api = usePinInput({ length: 2, defaultValue: ["1", "2"], form });
    return visible ? React.createElement(PinInput.RootProvider, { value: api },
      React.createElement(PinInput.Input, { index: 0 }),
      React.createElement(PinInput.Input, { index: 1 })) : null;
  }
  const render = props => act(async () => root.render(React.createElement(Fixture, props)));
  const flushReset = () => act(async () => { await new Promise(resolve => dom.window.setTimeout(resolve, 0)); });
  try {
    await render({ visible: false });
    await render({});
    await act(async () => api.setValue(["9", "8"]));
    await act(async () => document.getElementById("a").reset());
    await flushReset();
    assert.deepEqual(api.value, ["1", "2"]);
    await act(async () => api.setValue(["7", "6"]));
    await act(async () => {
      document.getElementById("a").reset();
      root.render(React.createElement(Fixture, { form: "b" }));
    });
    await flushReset();
    assert.deepEqual(api.value, ["7", "6"]);
    document.getElementById("b").addEventListener("reset", event => event.preventDefault(), { once: true });
    await act(async () => document.getElementById("b").reset());
    await flushReset();
    assert.deepEqual(api.value, ["7", "6"]);
    await act(async () => document.getElementById("b").reset());
    await flushReset();
    assert.deepEqual(api.value, ["1", "2"]);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
