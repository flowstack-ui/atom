import { JSDOM } from "jsdom";
import { assert, test, React } from "../test-utils.mjs";
import { NumberInput, useNumberInput } from "../../dist/number-input.js";

async function mounted(run) {
  const dom = new JSDOM("<div id='app'></div>", { pretendToBeVisual: true, url: "http://localhost" });
  const names = ["window", "document", "navigator", "HTMLElement", "Element", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[name] });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("app"));
  let api;
  function App({ options }) {
    api = useNumberInput(options);
    return React.createElement(NumberInput.RootProvider, { value: api }, React.createElement(NumberInput.Label, null, "Amount"), React.createElement(NumberInput.Input));
  }
  const render = options => React.act(async () => root.render(React.createElement(App, { options })));
  try { await run({ render, get api() { return api; } }); }
  finally {
    await React.act(async () => root.unmount());
    for (const name of names) { if (previous[name]) Object.defineProperty(globalThis, name, previous[name]); else delete globalThis[name]; }
    dom.window.close();
  }
}

test("NumberInput preserves incomplete numeric editing and clears stale submission", async () => mounted(async context => {
  await context.render({ defaultValue: 2, name: "amount" });
  await React.act(async () => context.api.handleFocus({}));
  await React.act(async () => context.api.handleChange({ target: { value: "-" } }));
  assert.equal(context.api.displayValue, "-");
  assert.equal(context.api.numericValue, null);
  assert.equal(document.querySelector('[type="hidden"]').value, "");
}));

test("NumberInput exposes localized string callback details", async () => mounted(async context => {
  const changes = [];
  await context.render({ valueMode: "string", locale: "de-DE", onValueChange: detail => changes.push(detail) });
  await React.act(async () => context.api.handleFocus({}));
  await React.act(async () => context.api.handleChange({ target: { value: "1.234,5" } }));
  assert.equal(context.api.valueAsNumber, 1234.5);
  assert.deepEqual(changes.at(-1), { value: "1.234,5", valueAsNumber: 1234.5 });
}));

test("NumberInput modifier steps retain smaller fractional values", async () => mounted(async context => {
  await context.render({ defaultValue: 0, step: 0.1, focusInputOnChange: false });
  await React.act(async () => context.api.handleKeyDown({ key: "ArrowUp", altKey: true, nativeEvent: {}, preventDefault() {} }));
  assert.equal(context.api.valueAsNumber, 0.01);
  assert.equal(context.api.displayValue, "0.01");
}));

test("NumberInput Enter commits and clamps without suppressing native submission", async () => mounted(async context => {
  const commits = [];
  await context.render({ defaultValue: 5, max: 2, onValueCommit: detail => commits.push(detail) });
  let prevented = false;
  await React.act(async () => context.api.handleKeyDown({ key: "Enter", nativeEvent: {}, preventDefault() { prevented = true; } }));
  assert.equal(context.api.valueAsNumber, 2);
  assert.equal(prevented, false);
  assert.deepEqual(commits, [{ value: "2", valueAsNumber: 2 }]);
}));

test("NumberInput first step focuses the input without restoring the previous text", async () => mounted(async context => {
  await context.render({ defaultValue: 2 });
  await React.act(async () => context.api.increment());
  assert.equal(document.activeElement, document.querySelector('[role="spinbutton"]'));
  assert.equal(context.api.valueAsNumber, 3);
  assert.equal(context.api.displayValue, "3");
}));
