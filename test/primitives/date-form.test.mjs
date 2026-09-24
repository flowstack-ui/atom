import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { DateInput } from "../../dist/date-input.js";
import { DatePicker } from "../../dist/date-picker.js";
import { Field } from "../../dist/field.js";
import { parseDate } from "../../dist/date-value.js";

async function withDom(run) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "MutationObserver", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map(key => [key, globalThis[key]]));
  for (const key of keys) globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key];
  const container = document.getElementById("root");
  const root = createRoot(container);
  try { await run(root, container); }
  finally {
    await React.act(async () => root.unmount());
    for (const key of keys) {
      if (previous[key] === undefined) delete globalThis[key];
      else globalThis[key] = previous[key];
    }
    dom.window.close();
  }
}

const referenceDate = parseDate("2026-09-05");
const h = React.createElement;
async function resetForm(form) {
  await React.act(async () => {
    form.reset();
    await new Promise(resolve => window.setTimeout(resolve, 0));
  });
}
test("multiple DatePicker reports required validation to Field and clears it after a value", () => withDom(async (root, container) => {
  const render = value => h("form", null, h(Field.Root, { required: true },
    h(Field.Label, null, "Meetings"), h(DatePicker.Root, { referenceDate, selectionMode: "multiple", value },
      h(DatePicker.Trigger, null, "Choose meetings"), h(DatePicker.HiddenInput))));
  await React.act(async () => root.render(render([])));
  await React.act(async () => { container.querySelector("form").checkValidity(); });
  assert.ok(container.querySelector('[data-slot="field"][data-invalid]'));
  await React.act(async () => root.render(render([referenceDate])));
  assert.equal(container.querySelector("input").validity.valid, true);
  assert.ok(!container.querySelector('[data-slot="field"][data-invalid]'), "valid selection clears Field invalid state");
}));
test("date picker inherits Field label and description without a duplicate label", () => withDom(async (root, container) => {
  await React.act(async () => root.render(h(Field.Root, null, h(Field.Label, null, "Delivery"), h(Field.Description, null, "Choose a business day"),
    h(DatePicker.Root, { referenceDate }, h(DatePicker.Input)))));
  const group = container.querySelector('[data-slot="date-input-segment-group"]');
  assert.equal(document.getElementById(group.getAttribute("aria-labelledby")).textContent, "Delivery");
  assert.equal(document.getElementById(group.getAttribute("aria-describedby")).textContent, "Choose a business day");
}));
function input(props = {}) {
  return h(DateInput.Root, { referenceDate, name: "date", ...props },
    h(DateInput.SegmentGroup, { "aria-label": "Date" }, h(DateInput.Segments)),
    h(DateInput.HiddenInput), h(DateInput.ClearTrigger, null, "Clear"));
}

test("uncontrolled date input resets its canonical value", () => withDom(async (root, container) => {
  await React.act(async () => root.render(h("form", null, input({ defaultValue: referenceDate }))));
  const form = container.querySelector("form");
  await React.act(async () => container.querySelector("button").click());
  assert.equal(new window.FormData(form).get("date"), "");
  await resetForm(form);
  assert.equal(new window.FormData(form).get("date"), "2026-09-05");
}));

test("controlled date input reset does not call the application setter", () => withDom(async (root, container) => {
  const calls = [];
  await React.act(async () => root.render(h("form", null, input({ value: referenceDate, onValueChange: value => calls.push(value) }))));
  await resetForm(container.querySelector("form"));
  assert.equal(calls.length, 0);
  assert.equal(container.querySelector("input").value, "2026-09-05");
}));

test("a partially selected optional date range cannot submit as a complete value", () => withDom(async (root, container) => {
  await React.act(async () => root.render(h("form", null,
    h(DateInput.Root, { referenceDate, selectionMode: "range", name: "trip", defaultValue: { start: referenceDate, end: null } },
      h(DateInput.HiddenInput), h(DateInput.HiddenInput, { index: 1 })))));
  let valid;
  await React.act(async () => { valid = container.querySelector("form").checkValidity(); });
  assert.equal(valid, false);
  assert.equal(container.querySelector('input[name="trip[start]"]').value, "");
}));

test("DatePicker resets its shared input value from the root coordinator", () => withDom(async (root, container) => {
  await React.act(async () => root.render(h("form", null,
    h(DatePicker.Root, { referenceDate, defaultValue: referenceDate, name: "appointment" },
      h(DatePicker.Input, { "aria-label": "Appointment" }), h(DatePicker.ClearTrigger, null, "Clear")))));
  await React.act(async () => container.querySelector("button").click());
  assert.equal(container.querySelector("input").value, "");
  await resetForm(container.querySelector("form"));
  assert.equal(container.querySelector("input").value, "2026-09-05");
}));

test("multiple DatePicker submits repeated canonical entries", () => withDom(async (root, container) => {
  await React.act(async () => root.render(h("form", null,
    h(DatePicker.Root, { referenceDate, selectionMode: "multiple", defaultValue: [referenceDate, referenceDate.add({ days: 1 })], name: "appointments" },
      h(DatePicker.HiddenInput)))));
  assert.deepEqual(new window.FormData(container.querySelector("form")).getAll("appointments"), ["2026-09-05", "2026-09-06"]);
}));
