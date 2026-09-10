import { JSDOM } from "jsdom";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { TagsInput, useTagsInput } from "../../dist/tags-input.js";
import { acceptTagsInputValues } from "../../dist/_internal/primitives/tags-input/controller.js";
const h = React.createElement;

for (const [name, current, input, options, reason] of [
  ["empty", [], ["  "], {}, "empty"],
  [
    "normalized duplicate",
    ["react"],
    [" REACT "],
    { sanitizeValue: (v) => v.trim().toLowerCase() },
    "duplicate",
  ],
  ["max", ["one"], ["two"], { max: 1 }, "rangeOverflow"],
  [
    "each pasted value",
    [],
    ["valid", "x"],
    { validate: ({ inputValue }) => inputValue.length > 2 },
    "invalidTag",
  ],
  ["max length", [], ["abc"], { maxLength: 2 }, "maxLength"],
])
  test(`TagsInput rejects ${name} atomically`, () => {
    const result = acceptTagsInputValues(current, input, options);
    assert.equal(result.accepted, false);
    assert.equal(result.reason, reason);
    assert.deepEqual(result.value, current);
  });
test("TagsInput acceptance supports explicit duplicates, overflow and normalized edits", () => {
  assert.deepEqual(
    acceptTagsInputValues(["a"], ["a"], { allowDuplicates: true }).value,
    ["a", "a"],
  );
  assert.deepEqual(
    acceptTagsInputValues(["a"], ["b"], { max: 1, allowOverflow: true }).value,
    ["a", "b"],
  );
  assert.deepEqual(
    acceptTagsInputValues(
      ["a", "b"],
      [" A "],
      { sanitizeValue: (v) => v.trim().toLowerCase() },
      0,
    ).value,
    ["a", "b"],
  );
});
test("TagsInput SSR contains one JSON field and no leaked options", () => {
  const html = renderToStaticMarkup(
    h(
      TagsInput.Root,
      { defaultValue: ["a,b", "零"], name: "tags", editable: true, max: 4 },
      h(TagsInput.Label, null, "Tags"),
      h(TagsInput.Control, null, h(TagsInput.Input)),
      h(TagsInput.HiddenInput),
    ),
  );
  assert.equal((html.match(/name="tags"/g) ?? []).length, 1);
  assert.match(html, /&quot;a,b&quot;/);
  assert.doesNotMatch(html, /allowDuplicates|editable=|max="4"/);
});
test("TagsInput rejected long drafts remain intact for correction", async () => {
  await mounted(async fixture => {
    await fixture.render({ maxLength: 3 });
    await React.act(async () => fixture.api.setInputValue("long,values"));
    await React.act(async () => fixture.api.addValues(["long", "values"]));
    assert.equal(fixture.api.inputValue, "long,values");
    assert.deepEqual(fixture.api.value, []);
  });
});
async function mounted(run) {
  const dom = new JSDOM(
    "<form id='form'><div id='app'></div></form><button id='outside'>Outside</button>",
    { pretendToBeVisual: true, url: "http://localhost" },
  );
  const names = [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "IS_REACT_ACT_ENVIRONMENT",
  ];
  const previous = Object.fromEntries(names.map((n) => [n, globalThis[n]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    configurable: true,
    writable: true,
  });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("app"));
  let api;
  function App({ options = {}, disabledIndex = -1 }) {
    api = useTagsInput(options);
    return h(
      TagsInput.RootProvider,
      { value: api },
      h(TagsInput.Label, null, "Tags"),
      h(
        TagsInput.Control,
        null,
        ...api.value.map((value, index) =>
          h(
            TagsInput.Item,
            { key: index, index, value, disabled: index === disabledIndex },
            h(
              TagsInput.ItemPreview,
              null,
              h(TagsInput.ItemText),
              h(TagsInput.ItemDeleteTrigger, null, "Remove"),
            ),
            h(TagsInput.ItemInput),
          ),
        ),
        h(TagsInput.Input),
        h(TagsInput.ClearTrigger, null, "Clear"),
      ),
      h(TagsInput.HiddenInput),
    );
  }
  const render = async (options = {}, disabledIndex = -1) =>
    React.act(async () => root.render(h(App, { options, disabledIndex })));
  try {
    await run({
      render,
      get api() {
        return api;
      },
      dom,
    });
  } finally {
    await React.act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
}
test("TagsInput rejected creation retains draft", async () =>
  mounted(async (c) => {
    await c.render({ defaultValue: ["one"], max: 1 });
    await React.act(async () => c.api.setInputValue("two"));
    await React.act(async () => assert.equal(c.api.addValue("two"), false));
    assert.deepEqual(c.api.value, ["one"]);
    assert.equal(c.api.inputValue, "two");
  }));
test("TagsInput sequential controller additions preserve every accepted value", async () =>
  mounted(async (c) => {
    await c.render();
    await React.act(async () => {
      c.api.addValue("one");
      c.api.addValue("two");
    });
    assert.deepEqual(c.api.value, ["one", "two"]);
  }));
test("TagsInput edits sanitize, validate and cancel without replacing another item", async () =>
  mounted(async (c) => {
    await c.render({
      defaultValue: ["one", "two"],
      editable: true,
      validate: ({ inputValue }) => inputValue.length > 2,
    });
    await React.act(async () => c.api.startEdit(0));
    await React.act(async () => c.api.setEditValue("x"));
    await React.act(async () => assert.equal(c.api.commitEdit(), false));
    assert.equal(c.api.editingIndex, 0);
    assert.equal(c.api.editValue, "x");
    await React.act(async () => c.api.cancelEdit());
    assert.deepEqual(c.api.value, ["one", "two"]);
    await React.act(async () => c.api.startEdit(1));
    await React.act(async () => c.api.setEditValue(" three "));
    await React.act(async () => assert.equal(c.api.commitEdit(), true));
    assert.deepEqual(c.api.value, ["one", "three"]);
  }));
test("TagsInput disabled occurrences survive clear and cannot be edited", async () =>
  mounted(async (c) => {
    await c.render(
      {
        defaultValue: ["one", "one", "two"],
        allowDuplicates: true,
        editable: true,
      },
      1,
    );
    await React.act(async () => c.api.startEdit(1));
    assert.equal(c.api.editingIndex, null);
    await React.act(async () => c.api.clearValue(1));
    assert.equal(c.api.count, 3);
    await React.act(async () => c.api.clearValue());
    assert.deepEqual(c.api.value, ["one"]);
  }));
test("TagsInput controlled replacement aborts stale edits", async () =>
  mounted(async (c) => {
    await c.render({ value: ["one", "two"], editable: true });
    await React.act(async () => c.api.startEdit(0));
    await React.act(async () => c.api.setEditValue("draft"));
    await c.render({ value: ["two", "one"], editable: true });
    assert.equal(c.api.editingIndex, null);
    assert.deepEqual(c.api.value, ["two", "one"]);
  }));
test("TagsInput readonly controller cannot mutate", async () =>
  mounted(async (c) => {
    await c.render({ defaultValue: ["one"], readOnly: true, editable: true });
    await React.act(async () => {
      c.api.clearValue();
      c.api.addValue("two");
      c.api.setInputValue("draft");
      c.api.startEdit(0);
    });
    assert.deepEqual(c.api.value, ["one"]);
    assert.equal(c.api.inputValue, "");
    assert.equal(c.api.editingIndex, null);
  }));
test("TagsInput reset restores collection and draft, and honors prevented reset", async () =>
  mounted(async (c) => {
    await c.render({
      defaultValue: ["one"],
      defaultInputValue: "original draft",
      name: "tags",
    });
    await React.act(async () => c.api.addValue("two"));
    await React.act(async () => document.getElementById("form").reset());
    assert.deepEqual(c.api.value, ["one"]);
    assert.equal(c.api.inputValue, "original draft");
    document
      .getElementById("form")
      .addEventListener("reset", (event) => event.preventDefault(), {
        once: true,
      });
    await React.act(async () => c.api.addValue("three"));
    await React.act(async () => document.getElementById("form").reset());
    assert.deepEqual(c.api.value, ["one", "three"]);
  }));
test("TagsInput unrelated focus cannot submit an untouched draft", async () =>
  mounted(async (c) => {
    await c.render({ defaultInputValue: "draft", blurBehavior: "add" });
    await React.act(async () => document.getElementById("outside").focus());
    assert.deepEqual(c.api.value, []);
    assert.equal(c.api.inputValue, "draft");
    await React.act(async () =>
      document.querySelector('[data-slot="tags-input-input"]').focus(),
    );
    await React.act(async () => document.getElementById("outside").focus());
    assert.deepEqual(c.api.value, ["draft"]);
  }));
