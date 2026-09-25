import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { RadioCard, useRadioCard } from "../../dist/radio-card.js";
const h = React.createElement;
const item = (value, props = {}) => h(RadioCard.Item, { value, ...props }, h(RadioCard.HiddenInput), h(RadioCard.Control, null, h(RadioCard.Title, null, value), h(RadioCard.Description, null, `${value} description`), h(RadioCard.Indicator)));
const group = (props = {}) => h(RadioCard.Root, { name: "plan", ...props }, h(RadioCard.Label, null, "Plan"), item("a"), item("b"), item("c", { disabled: true }));
async function mount(element, run, hydrate = false) {
  const dom = new JSDOM(`<div id='root'>${hydrate ? renderToStaticMarkup(element) : ""}</div>`, { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "IS_REACT_ACT_ENVIRONMENT"];
  const old = keys.map(k => globalThis[k]);
  keys.forEach(k => globalThis[k] = k === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[k] ?? dom.window);
  let root;
  const errors = [];
  try {
    await React.act(() => {
      root = hydrate ? hydrateRoot(document.getElementById("root"), element, { onRecoverableError: error => errors.push(error) }) : createRoot(document.getElementById("root"));
      if (!hydrate) root.render(element);
    });
    assert.deepEqual(errors, []);
    await run(document, root);
  }
  finally { await React.act(() => root.unmount()); keys.forEach((k, i) => globalThis[k] = old[i]); dom.window.close(); }
}
test("RadioCard SSR preserves native inputs without button radios", () => {
  const html = renderToStaticMarkup(group({ defaultValue: "a" }));
  assert.equal((html.match(/type="radio"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<button|role="radio"/);
});
test("RadioCard hydrates native inputs and keeps selection interactive", async () => {
  await mount(group({ defaultValue: "a" }), async doc => {
    assert.equal(doc.querySelector('input[value="a"]').checked, true);
    await React.act(() => doc.querySelector('input[value="b"]').click());
    assert.equal(doc.querySelector('input[value="b"]').checked, true);
    assert.ok(doc.getElementById(doc.querySelector('input[value="b"]').getAttribute("aria-labelledby")));
  }, true);
});
test("RadioCard native label selects once and separates name/description", async () => {
  const changes = [];
  await mount(group({ onValueChange: v => changes.push(v) }), async doc => {
    const input = doc.querySelector('input[value="a"]');
    assert.equal(doc.getElementById(input.getAttribute("aria-labelledby")).textContent, "a");
    assert.equal(doc.getElementById(input.getAttribute("aria-describedby")).textContent, "a description");
    await React.act(() => doc.querySelector("label").click());
    assert.equal(input.checked, true); assert.deepEqual(changes, ["a"]);
    await React.act(() => input.click()); assert.deepEqual(changes, ["a"]);
  });
});
test("RadioCard shares keyboard navigation and disabled skipping", async () => {
  await mount(group({ defaultValue: "a", orientation: "horizontal" }), async doc => {
    const a = doc.querySelector('input[value="a"]'), b = doc.querySelector('input[value="b"]');
    await React.act(() => a.focus());
    await React.act(() => a.dispatchEvent(new doc.defaultView.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })));
    assert.equal(doc.activeElement, b); assert.equal(b.checked, true);
    await React.act(() => b.dispatchEvent(new doc.defaultView.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })));
    assert.equal(doc.activeElement, a); assert.equal(a.checked, true);
  });
});
test("RadioCard forms submit one value and uncontrolled reset restores default", async () => {
  await mount(h("form", null, group({ defaultValue: "a" })), async doc => {
    await React.act(() => doc.querySelector('input[value="b"]').click());
    assert.deepEqual([...new doc.defaultView.FormData(doc.querySelector("form"))], [["plan", "b"]]);
    await React.act(() => doc.querySelector("form").reset());
    assert.equal(doc.querySelector('input[value="a"]').checked, true);
  });
});
for (const state of ["disabled", "readOnly"]) test(`RadioCard ${state} locks native activation`, async () => {
  await mount(group({ defaultValue: "a", [state]: true }), async doc => {
    await React.act(() => doc.querySelectorAll("label")[1].click());
    await React.act(() => doc.querySelector('input[value="b"]').click());
    assert.equal(doc.querySelector('input[value="a"]').checked, true);
    assert.equal(doc.querySelector('input[value="b"]').checked, false);
  });
});
test("RadioCard RootProvider uses one controller", async () => {
  function Fixture() { const value = useRadioCard({ defaultValue: "a" }); return h(RadioCard.RootProvider, { value, "aria-label": "Plan" }, item("a"), item("b")); }
  await mount(h(Fixture), async doc => { await React.act(() => doc.querySelector('input[value="b"]').click()); assert.equal(doc.querySelector('input[value="b"]').checked, true); });
});
test("RadioCard external form, input and label refs preserve ownership", async () => {
  const label = React.createRef(), input = React.createRef(), rootRef = React.createRef();
  await mount(h(React.Fragment, null, h("form", { id: "external" }), h(RadioCard.Root, { ref: rootRef, form: "external", name: "plan", defaultValue: "a", "aria-label": "Plan" }, h(RadioCard.Item, { value: "a", ref: label }, h(RadioCard.HiddenInput, { ref: input }), h(RadioCard.Title, null, "Alpha")))), async doc => {
    assert.equal(rootRef.current.tagName, "DIV"); assert.equal(label.current.tagName, "LABEL"); assert.equal(input.current.tagName, "INPUT");
    assert.deepEqual([...new doc.defaultView.FormData(doc.querySelector("form"))], [["plan", "a"]]);
  });
});
test("RadioCard RTL and read-only arrows move focus without changing value", async () => {
  await mount(group({ defaultValue: "a", readOnly: true, orientation: "horizontal", dir: "rtl" }), async doc => {
    const a = doc.querySelector('input[value="a"]'), b = doc.querySelector('input[value="b"]');
    await React.act(() => a.focus());
    await React.act(() => a.dispatchEvent(new doc.defaultView.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })));
    assert.equal(doc.activeElement, b); assert.equal(a.checked, true); assert.equal(b.checked, false);
  });
});
test("RadioCard input ARIA overrides and dynamic description removal remain correct", async () => {
  const fixture = description => h(RadioCard.Root, { "aria-label": "Plan" }, h(RadioCard.Item, { value: "a" }, h(RadioCard.HiddenInput, { "aria-label": "Override" }), h(RadioCard.Title, null, "Alpha"), description ? h(RadioCard.Description, null, "Details") : null));
  await mount(fixture(true), async (doc, root) => {
    const input = doc.querySelector("input"); assert.equal(input.hasAttribute("aria-labelledby"), false); assert.equal(input.hasAttribute("aria-describedby"), true);
    await React.act(() => root.render(fixture(false))); assert.equal(input.hasAttribute("aria-describedby"), false);
  });
});
test("RadioCard canceled label activation does not select", async () => {
  await mount(h(RadioCard.Root, { "aria-label": "Plan" }, item("a", { onClick: e => e.preventDefault() })), async doc => {
    await React.act(() => doc.querySelector("label").click()); assert.equal(doc.querySelector("input").checked, false);
  });
});
test("RadioCard required group uses shared validity and one selected successful input", async () => {
  await mount(h("form", null, group({ required: true })), async doc => {
    const form = doc.querySelector("form");
    await React.act(() => { assert.equal(form.checkValidity(), false); });
    await React.act(() => doc.querySelector('input[value="b"]').click());
    await React.act(() => { assert.equal(form.checkValidity(), true); });
    assert.deepEqual([...new doc.defaultView.FormData(form)], [["plan", "b"]]);
  });
});
