import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Switch } from "../../dist/switch.js";
import { Fieldset } from "../../dist/fieldset.js";
import { Field } from "../../dist/field.js";

const h = React.createElement;
const compound = (props = {}) => h(
  Switch.Field,
  { id: "preference", name: "preference", value: "enabled", ...props },
  h(Switch.Control, null, h(Switch.Thumb)),
  h(Switch.Label, null, "Preference"),
  h(Switch.HiddenInput),
);

test("compound Switch respects its nearest independent Field validity", () => {
  const html = renderToStaticMarkup(h(Fieldset.Root, { invalid: true },
    h(Field.Root, null, compound())));
  const dom = new JSDOM(html);
  try {
    assert.equal(dom.window.document.querySelector('[role="switch"]').getAttribute("aria-invalid"), null);
    assert.equal(dom.window.document.querySelector("fieldset").getAttribute("aria-invalid"), "true");
  } finally { dom.window.close(); }
});

test("compound Switch preserves disabled custom control hosts", async () => {
  for (const child of [h("button", { disabled: true }), h("div", { "aria-disabled": true })]) {
    await mount(h(Switch.Field, null,
      h(Switch.Label, null, "Setting"),
      h(Switch.Control, { asChild: true }, child),
      h(Switch.HiddenInput)), async document => {
      const control = document.querySelector('[role="switch"]');
      assert.equal(control.getAttribute("aria-disabled"), "true");
      await React.act(() => control.click());
      assert.equal(control.getAttribute("aria-checked"), "false");
    });
  }
});

async function mount(element, run, hydrate = false) {
  const dom = new JSDOM(`<div id="root">${hydrate ? renderToStaticMarkup(element) : ""}</div>`, { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "MouseEvent", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = keys.map((key) => globalThis[key]);
  keys.forEach((key) => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] ?? dom.window; });
  let root;
  const errors = [];
  try {
    await React.act(() => {
      root = hydrate
        ? hydrateRoot(document.getElementById("root"), element, { onRecoverableError: (error) => errors.push(error) })
        : createRoot(document.getElementById("root"));
      if (!hydrate) root.render(element);
    });
    assert.deepEqual(errors, []);
    await run(document);
  } finally {
    await React.act(() => root.unmount());
    keys.forEach((key, index) => { globalThis[key] = previous[index]; });
    dom.window.close();
  }
}

test("Switch compound hydrates one native input and remains interactive", async () => {
  await mount(compound({ defaultChecked: true }), async (document) => {
    assert.equal(document.querySelectorAll('input[type="checkbox"]').length, 1);
    const control = document.querySelector('[role="switch"]');
    assert.equal(control.getAttribute("aria-checked"), "true");
    await React.act(() => control.click());
    assert.equal(control.getAttribute("aria-checked"), "false");
  }, true);
});

test("Switch custom part IDs update label activation and accessible naming", async () => {
  function Fixture() {
    const [custom, setCustom] = React.useState(true);
    return h(React.StrictMode, null,
      h(Switch.Field, { id: "preference" },
        h(Switch.Control, { id: custom ? "custom-control" : undefined }),
        h(Switch.Label, { id: custom ? "custom-label" : undefined }, "Preference"),
        h(Switch.HiddenInput)),
      h("button", { id: "restore", onClick: () => setCustom(false) }, "Restore"));
  }
  await mount(h(Fixture), async (document) => {
    const control = document.querySelector('[role="switch"]');
    const label = document.querySelector("label");
    assert.equal(label.control, control);
    assert.equal(control.getAttribute("aria-labelledby"), label.id);
    await React.act(() => label.click());
    assert.equal(control.getAttribute("aria-checked"), "true");
    await React.act(() => document.querySelector("#restore").click());
    assert.equal(control.id, "preference-control");
    assert.equal(label.id, "preference-label");
    assert.equal(label.control, control);
    assert.equal(control.getAttribute("aria-labelledby"), label.id);
  });
});

test("Switch owner IDs associate parts on the server and after hydration", async () => {
  const element = compound({ ids: { control: "ssr-control", label: "ssr-label", input: "ssr-input" } });
  const html = renderToStaticMarkup(element);
  assert.match(html, /id="ssr-control"/);
  assert.match(html, /for="ssr-control"/);
  assert.match(html, /aria-labelledby="ssr-label"/);
  assert.match(html, /id="ssr-input"/);
  await mount(element, async (document) => {
    const label = document.querySelector("label");
    const control = document.querySelector('[role="switch"]');
    assert.equal(label.control, control);
    await React.act(() => label.click());
    assert.equal(control.getAttribute("aria-checked"), "true");
  }, true);
});

test("Switch explicit label associations remain caller-owned", async () => {
  const element = h(Switch.Field, { ids: { control: "owned-control", label: "owned-label" } },
    h("span", { id: "external-name" }, "External name"),
    h(Switch.Control, { "aria-labelledby": "external-name" }),
    h(Switch.Label, { htmlFor: "external-control" }, "External target"),
    h(Switch.HiddenInput));
  await mount(element, async (document) => {
    assert.equal(document.querySelector('[role="switch"]').getAttribute("aria-labelledby"), "external-name");
    assert.equal(document.querySelector("label").htmlFor, "external-control");
  });
});

test("Switch controlled form reset preserves external ownership", async () => {
  function Controlled() {
    const [checked, setChecked] = React.useState(true);
    return h("form", null, compound({ checked, onCheckedChange: setChecked }), h("button", { type: "reset" }, "Reset"));
  }
  await mount(h(Controlled), async (document) => {
    const control = document.querySelector('[role="switch"]');
    await React.act(() => control.click());
    assert.equal(control.getAttribute("aria-checked"), "false");
    await React.act(() => document.querySelector("form").reset());
    assert.equal(control.getAttribute("aria-checked"), "false");
  });
});

test("Switch inherits disabled Fieldset state and omits submission", async () => {
  const fixture = h("form", null, h(Fieldset.Root, { disabled: true }, compound({ defaultChecked: true })));
  await mount(fixture, async (document) => {
    const control = document.querySelector('[role="switch"]');
    assert.equal(control.disabled, true);
    await React.act(() => control.click());
    assert.equal(control.getAttribute("aria-checked"), "true");
    assert.deepEqual([...new document.defaultView.FormData(document.querySelector("form"))], []);
  });
});
