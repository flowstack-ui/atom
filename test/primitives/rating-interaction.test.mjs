import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Rating, useRating } from "../../dist/rating.js";
import { Fieldset } from "../../dist/fieldset.js";
import { createPortal } from "react-dom";
const h = React.createElement;
const items = () => [1, 2, 3, 4, 5].map(value => h(Rating.Item, { value, key: value }, "★"));
const fixture = props => h(Rating.Root, { "aria-label": "Score", defaultValue: 2, name: "score", ...props }, items());
async function mount(element, run, hydrate = false) {
  const dom = new JSDOM(`<main>${hydrate ? renderToStaticMarkup(element) : ""}</main>`, { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "MouseEvent", "IS_REACT_ACT_ENVIRONMENT"];
  const old = keys.map(key => globalThis[key]);
  keys.forEach(key => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
  let root;
  const errors = [];
  try {
    await React.act(() => {
      root = hydrate ? hydrateRoot(document.querySelector("main"), element, { onRecoverableError: error => errors.push(error) }) : createRoot(document.querySelector("main"));
      if (!hydrate) root.render(element);
    });
    await run(document, dom.window, root);
    assert.deepEqual(errors, []);
  } finally {
    await React.act(() => root?.unmount());
    keys.forEach((key, i) => { globalThis[key] = old[i]; });
    dom.window.close();
  }
}
function pointer(win, target, type, options = {}) {
  const event = new win.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...options });
  Object.defineProperties(event, { pointerId: { value: options.pointerId ?? 1 }, isPrimary: { value: options.isPrimary ?? true }, pointerType: { value: options.pointerType ?? "mouse" } });
  target.dispatchEvent(event);
}

test("Rating ignores right, middle and nonprimary activation; hover never submits", async () => {
  const changes = [], hover = [];
  await mount(h("form", null, fixture({ onValueChange: value => changes.push(value), onHoverChange: value => hover.push(value) })), async (doc, win) => {
    const item = doc.querySelectorAll('[data-slot="rating-item"]')[4];
    for (const options of [{ button: 2 }, { button: 1 }, { isPrimary: false }]) {
      await React.act(() => pointer(win, item, "pointerdown", options));
    }
    assert.deepEqual(changes, []);
    await React.act(() => pointer(win, item, "pointermove"));
    assert.deepEqual(hover, [5]);
    assert.equal(doc.querySelector('[role="slider"]').getAttribute("aria-valuenow"), "2");
    assert.equal(new win.FormData(doc.querySelector("form")).get("score"), "2");
    assert.equal(item.dataset.fill, "100");
    await React.act(() => pointer(win, item, "pointerdown", { buttons: 1 }));
    await React.act(() => pointer(win, item, "pointerup"));
    assert.deepEqual(changes, [5]);
    assert.equal(doc.activeElement.getAttribute("role"), "slider");
  });
});

test("Rating disabled overrides tabIndex and readOnly stays focusable", () => {
  assert.match(renderToStaticMarkup(fixture({ disabled: true, tabIndex: 4 })), /tabindex="-1"/);
  assert.match(renderToStaticMarkup(fixture({ readOnly: true })), /tabindex="0"/);
  assert.match(renderToStaticMarkup(h(Fieldset.Root, { disabled: true }, fixture({ disabled: false }))), /aria-disabled="true"/);
});

test("Rating native fieldset changes, first legend exception and hydration", async () => {
  await mount(h("fieldset", { disabled: true }, h("legend", null, fixture({ id: "exception" })), fixture({ id: "disabled" })), async (doc) => {
    assert.equal(doc.querySelector("#exception").getAttribute("aria-disabled"), null);
    assert.equal(doc.querySelector("#disabled").tabIndex, -1);
    await React.act(async () => { doc.querySelector("fieldset").disabled = false; await Promise.resolve(); });
    assert.equal(doc.querySelector("#disabled").tabIndex, 0);
  }, true);
});

test("Rating controller compound label and manual input hydrate without duplicates", async () => {
  function Fixture() {
    const controller = useRating({ defaultValue: 3, name: "score", inputMode: "manual" });
    return h("form", null, h(Rating.RootProvider, { controller },
      h(Rating.Label, null, "Score"), h(Rating.Control, null, items()), h(Rating.HiddenInput)),
    h("button", { type: "button", onClick: () => controller.setValue(4) }, "Set"));
  }
  assert.match(renderToStaticMarkup(h(Fixture)), /aria-labelledby=/);
  await mount(h(Fixture), async (doc, win) => {
    assert.equal(doc.querySelectorAll('input[name="score"]').length, 1);
    await React.act(() => doc.querySelector("button").click());
    assert.equal(new win.FormData(doc.querySelector("form")).get("score"), "4");
    const label = doc.querySelector('[data-slot="rating-label"]');
    await React.act(() => label.click());
    assert.equal(doc.activeElement.getAttribute("aria-labelledby"), label.id);
  }, true);
});

test("Rating rejects automatic or duplicate authored inputs on the server", () => {
  assert.throws(() => renderToStaticMarkup(h(Rating.Root, null, h(Rating.HiddenInput))), /manual/);
  assert.throws(() => renderToStaticMarkup(h(Rating.Root, { inputMode: "manual" }, h(Rating.HiddenInput), h(Rating.HiddenInput))), /one HiddenInput/);
});

test("Rating reset clears preview and respects cancellation and controlled ownership", async () => {
  await mount(h("form", null, fixture()), async (doc, win) => {
    const slider = doc.querySelector('[role="slider"]');
    await React.act(() => slider.dispatchEvent(new win.KeyboardEvent("keydown", { key: "End", bubbles: true })));
    assert.equal(slider.dataset.value, "5");
    const prevent = event => event.preventDefault();
    doc.querySelector("form").addEventListener("reset", prevent);
    await React.act(async () => { doc.querySelector("form").reset(); await new Promise(resolve => setTimeout(resolve, 5)); });
    assert.equal(slider.dataset.value, "5");
    doc.querySelector("form").removeEventListener("reset", prevent);
    await React.act(async () => { doc.querySelector("form").reset(); await new Promise(resolve => setTimeout(resolve, 5)); });
    assert.equal(slider.dataset.value, "2");
  });
});

test("Rating cancellation rolls back but capture loss retains committed pointer value", async () => {
  await mount(fixture(), async (doc, win) => {
    const item = doc.querySelectorAll('[data-slot="rating-item"]')[4];
    const root = doc.querySelector('[role="slider"]');
    await React.act(() => pointer(win, item, "pointerdown", { buttons: 1 }));
    assert.equal(root.dataset.value, "5");
    await React.act(() => pointer(win, item, "pointercancel"));
    assert.equal(root.dataset.value, "2");
    await React.act(() => pointer(win, item, "pointerdown", { buttons: 1 }));
    await React.act(() => pointer(win, item, "lostpointercapture"));
    assert.equal(root.dataset.value, "5");
    await React.act(() => pointer(win, item, "pointercancel"));
    assert.equal(root.dataset.value, "5");
  });
});

test("Rating ignores edits after disabling an active interaction", async () => {
  await mount(fixture(), async (doc, win, root) => {
    const item = doc.querySelectorAll('[data-slot="rating-item"]')[4];
    await React.act(() => pointer(win, item, "pointerdown", { buttons: 1 }));
    await React.act(() => root.render(fixture({ disabled: true, readOnly: true })));
    await React.act(() => pointer(win, item, "pointercancel"));
    assert.equal(doc.querySelector('[role="slider"]').dataset.value, "5");
    assert.equal(doc.querySelector('[role="slider"]').tabIndex, -1);
  });
});

test("Rating required invalid state respects prevented reset and clears on accepted reset", async () => {
  await mount(h("form", null, fixture({ defaultValue: 0, required: true, validationBehavior: "inline" })), async (doc, win) => {
    const slider = doc.querySelector('[role="slider"]');
    const proxy = doc.querySelector('input[type="checkbox"]');
    await React.act(() => { proxy.checkValidity(); });
    assert.equal(slider.getAttribute("aria-invalid"), "true");
    const prevent = event => event.preventDefault();
    const form = doc.querySelector("form");
    form.addEventListener("reset", prevent);
    await React.act(async () => { form.reset(); await new Promise(resolve => setTimeout(resolve, 5)); });
    assert.equal(slider.getAttribute("aria-invalid"), "true");
    form.removeEventListener("reset", prevent);
    await React.act(async () => { form.reset(); await new Promise(resolve => setTimeout(resolve, 5)); });
    assert.equal(slider.getAttribute("aria-invalid"), null);
    await React.act(() => slider.dispatchEvent(new win.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    assert.equal(proxy.validity.valid, true);
  });
});

test("Rating controlled external form reset retains caller state and one named value", async () => {
  await mount(h(React.Fragment, null, h("form", { id: "external" }), fixture({ value: 4, form: "external" })), async (doc, win) => {
    await React.act(async () => { doc.querySelector("form").reset(); await new Promise(resolve => setTimeout(resolve, 5)); });
    assert.equal(doc.querySelector('[role="slider"]').dataset.value, "4");
    assert.deepEqual([...new win.FormData(doc.querySelector("form"))], [["score", "4"]]);
  });
});

test("Rating finite normalization, keyboard cancellation, autofocus and ref cleanup", async () => {
  const ref = React.createRef();
  await mount(fixture({ ref, min: NaN, max: Infinity, step: Infinity, defaultValue: NaN, autoFocus: true, onKeyDown: event => event.preventDefault() }), async (doc, win, root) => {
    assert.equal(doc.activeElement, ref.current);
    assert.equal(ref.current.dataset.value, "0");
    assert.equal(ref.current.dataset.max, "5");
    assert.equal(ref.current.dataset.step, "1");
    await React.act(() => ref.current.dispatchEvent(new win.KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true })));
    assert.equal(ref.current.dataset.value, "0");
    await React.act(() => root.render(null));
    assert.equal(ref.current, null);
  });
});

test("Rating uses iframe owner document for labels, native fieldsets and focus", async () => {
  await mount(null, async (doc, win, root) => {
    const frame = doc.createElement("iframe"); doc.body.append(frame);
    const target = frame.contentDocument.body;
    await React.act(() => root.render(createPortal(h("fieldset", null, h(Rating.Root, null, h(Rating.Label, null, "Inside frame"), h(Rating.Control, null, items()))), target)));
    await React.act(() => target.querySelector('[data-slot="rating-label"]').click());
    assert.equal(frame.contentDocument.activeElement.getAttribute("role"), "slider");
    await React.act(async () => { target.querySelector("fieldset").disabled = true; await Promise.resolve(); });
    assert.equal(target.querySelector('[role="slider"]').tabIndex, -1);
    await React.act(() => root.render(null));
    frame.remove();
  });
});
