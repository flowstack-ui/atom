import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { DatePicker, useDatePicker } from "../../dist/date-picker.js";
import { parseDate } from "../../dist/date-value.js";
const h = React.createElement;
const date = parseDate("2026-09-18");

async function mount(element, run, hydrate = false) {
  const dom = new JSDOM(`<main>${hydrate ? renderToStaticMarkup(element) : ""}</main>`, { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "MouseEvent", "MutationObserver", "HTMLInputElement", "requestAnimationFrame", "cancelAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = keys.map(key => globalThis[key]);
  keys.forEach(key => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
  let root;
  const errors = [];
  try {
    await React.act(async () => {
      root = hydrate ? hydrateRoot(document.querySelector("main"), element, { onRecoverableError: error => errors.push(error) }) : createRoot(document.querySelector("main"));
      if (!hydrate) root.render(element);
    });
    await run(document, dom.window);
    assert.deepEqual(errors, []);
  } finally {
    await React.act(async () => root?.unmount());
    keys.forEach((key, i) => { globalThis[key] = previous[i]; });
    dom.window.close();
  }
}

test("text drafts never submit an old committed value and can recover through the store", async () => {
  let store;
  const changes = [];
  function Fixture() {
    store = useDatePicker({ referenceDate: date, defaultValue: date, name: "date", entryMode: "text", onValueChange: value => changes.push(value?.toString()) });
    return h("form", null, h(DatePicker.RootProvider, { value: store }, h(DatePicker.TextInput, { "aria-label": "Date" })));
  }
  await mount(h(Fixture), async (doc, win) => {
    const form = doc.querySelector("form");
    assert.equal(new win.FormData(form).get("date"), "2026-09-18");
    await React.act(() => store.setDraft(0, "2026-02-30"));
    assert.equal(store.valid, false);
    assert.equal(doc.querySelector('[data-slot="date-picker-text-input"]').value, "2026-02-30");
    assert.equal(new win.FormData(form).get("date"), "");
    assert.equal(store.commitDraft(0), false);
    assert.deepEqual(changes, []);
    await React.act(() => store.setDraft(0, "2026-09-20"));
    await React.act(() => store.commitDraft(0));
    assert.deepEqual(changes, ["2026-09-20"]);
    assert.equal(store.focusedValue.toString(), "2026-09-20");
    assert.equal(new win.FormData(form).get("date"), "2026-09-20");
  }, true);
});

test("external invalid state does not trap a corrected text draft", async () => {
  let store;
  const changes = [];
  function Fixture() {
    store = useDatePicker({ referenceDate: date, entryMode: "text", invalid: true, onValueChange: value => changes.push(value?.toString()) });
    return h(DatePicker.RootProvider, { value: store }, h(DatePicker.TextInput));
  }
  await mount(h(Fixture), async () => {
    await React.act(() => store.setDraft(0, "2026-09-23"));
    assert.equal(store.valid, false);
    await React.act(() => assert.equal(store.commitDraft(0), true));
    assert.deepEqual(changes, ["2026-09-23"]);
  });
});

test("text ranges retain endpoint identity while the end is entered first", async () => {
  let store;
  function Fixture() {
    store = useDatePicker({ referenceDate: date, selectionMode: "range", name: "trip", entryMode: "text" });
    return h("form", null, h(DatePicker.RootProvider, { value: store }, h(DatePicker.TextInput), h(DatePicker.TextInput, { index: 1 })));
  }
  await mount(h(Fixture), async (doc, win) => {
    await React.act(() => store.setDraft(1, "2026-09-20"));
    assert.equal(store.valid, false);
    assert.equal(new win.FormData(doc.querySelector("form")).get("trip[start]"), "");
    await React.act(() => store.setDraft(0, "2026-09-18"));
    await React.act(() => store.commitDraft(0));
    assert.equal(store.value.start.toString(), "2026-09-18");
    assert.equal(store.value.end.toString(), "2026-09-20");
  });
});

test("text drafts commit once on leaving the whole control, not an internal action", async () => {
  let store;
  const changes = [];
  function Fixture() {
    store = useDatePicker({ referenceDate: date, entryMode: "text", onValueChange: value => changes.push(value?.toString()) });
    return h("div", null, h(DatePicker.RootProvider, { value: store }, h(DatePicker.TextInput), h("button", { id: "internal" }, "Action")), h("button", { id: "outside" }, "Outside"));
  }
  await mount(h(Fixture), async doc => {
    await React.act(() => store.setDraft(0, "2026-09-23"));
    await React.act(() => store.commitBoundary(doc.querySelector("#internal")));
    assert.deepEqual(changes, []);
    await React.act(() => store.commitBoundary(doc.querySelector("#outside")));
    assert.deepEqual(changes, ["2026-09-23"]);
    await React.act(() => store.commitBoundary(null));
    assert.deepEqual(changes, ["2026-09-23"]);
    await React.act(() => store.setDraft(0, "2026-09-24"));
    store._composingRef.current = true;
    await React.act(() => store.commitBoundary(null));
    assert.equal(store.commitDraft(0), false);
    assert.deepEqual(changes, ["2026-09-23"]);
    store._composingRef.current = false;
    await React.act(() => store.commitBoundary(null));
    assert.deepEqual(changes, ["2026-09-23", "2026-09-24"]);
  });
});

test("calendar navigation survives removing and restoring the calendar part", async () => {
  let store, show;
  function Fixture() {
    store = useDatePicker({ referenceDate: date, entryMode: "none" });
    const [visible, setVisible] = React.useState(true);
    show = setVisible;
    return h(DatePicker.RootProvider, { value: store }, visible && h(DatePicker.Calendar));
  }
  await mount(h(Fixture), async () => {
    await React.act(() => store.setFocusedValue(date.add({ months: 3 })));
    await React.act(() => store.setView("month"));
    await React.act(() => show(false));
    await React.act(() => show(true));
    assert.equal(store.focusedValue.month, 12);
    assert.equal(store.view, "month");
    assert.equal(store.value, null);
  });
});
