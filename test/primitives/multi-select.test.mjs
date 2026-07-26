import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Field,
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectItemIndicator,
  MultiSelectItemText,
  MultiSelectLabel,
  MultiSelectRoot,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectViewport,
} from "../../dist/index.js";

function fixture(rootProps = {}) {
  return React.createElement(
    MultiSelectRoot,
    { defaultValue: ["design", "docs"], defaultOpen: true, name: "skills", ...rootProps },
    React.createElement(
      MultiSelectTrigger,
      { "aria-label": "Skills", "data-prop-check": "trigger" },
      React.createElement(MultiSelectValue, { placeholder: "Choose skills" }),
    ),
    React.createElement(
      MultiSelectContent,
      { disablePortal: true },
      React.createElement(
        MultiSelectViewport,
        null,
        React.createElement(
          MultiSelectGroup,
          null,
          React.createElement(MultiSelectLabel, null, "Available skills"),
          React.createElement(
            MultiSelectItem,
            { value: "design" },
            React.createElement(MultiSelectItemText, null, "Design"),
            React.createElement(MultiSelectItemIndicator, null, "check"),
          ),
          React.createElement(MultiSelectItem, { value: "docs" }, "Documentation"),
          React.createElement(MultiSelectItem, { value: "ops", disabled: true }, "Operations"),
        ),
      ),
    ),
  );
}

test("MultiSelect renders a button-owned multi-select listbox and selected options", () => {
  const html = renderToStaticMarkup(fixture());
  assert.match(html, /<button[^>]*aria-expanded="true"/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.doesNotMatch(html, /role="combobox"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /role="option"[^>]*aria-selected="true"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-prop-check="trigger"/);
});

test("MultiSelect summarizes values and allows custom summary rendering", () => {
  const html = renderToStaticMarkup(fixture());
  assert.match(html, />Design \(\+1 more\)<\/span>/);

  const custom = renderToStaticMarkup(
    React.createElement(
      MultiSelectRoot,
      { defaultValue: ["a", "b"] },
      React.createElement(
        MultiSelectTrigger,
        { "aria-label": "Letters" },
        React.createElement(MultiSelectValue, {
          renderValue: (values) => `${values.length} selected`,
        }),
      ),
      React.createElement(MultiSelectItem, { value: "a", label: "A" }),
      React.createElement(MultiSelectItem, { value: "b", label: "B" }),
    ),
  );
  assert.match(custom, />2 selected<\/span>/);
});

test("MultiSelect native multiple select submits every value and required state", () => {
  const html = renderToStaticMarkup(fixture({ required: true, form: "profile" }));
  assert.match(html, /<select[^>]*name="skills"[^>]*multiple=""/);
  assert.match(html, /form="profile"/);
  assert.match(html, /required=""/);
  assert.match(html, /<option value="design" selected="">Design<\/option>/);
  assert.match(html, /<option value="docs" selected="">Documentation<\/option>/);
});

test("MultiSelect inherits Field relationships and disabled state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      { id: "skills", disabled: true, required: true },
      React.createElement(Field.Label, null, "Skills"),
      React.createElement(Field.Description, null, "Choose one or more."),
      fixture(),
    ),
  );
  assert.match(html, /id="skills-control"/);
  assert.match(html, /aria-labelledby="skills-label"/);
  assert.match(html, /aria-describedby="skills-description"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /<select[^>]*disabled=""/);
});

test("MultiSelect namespace and source preserve toggling, focus, dismissal, and composition", async () => {
  assert.equal(MultiSelect.Root, MultiSelectRoot);
  assert.equal(MultiSelect.Content, MultiSelectContent);
  assert.equal(MultiSelect.Item, MultiSelectItem);
  const root = await readFile(new URL("src/primitives/multi-select/MultiSelectRoot.tsx", packageRoot), "utf8");
  const trigger = await readFile(new URL("src/primitives/multi-select/MultiSelectTrigger.tsx", packageRoot), "utf8");
  const listbox = await readFile(new URL("src/primitives/multi-select/MultiSelectListbox.tsx", packageRoot), "utf8");
  assert.match(root, /value\.includes\(next\)/);
  assert.match(root, /useFormReset/);
  assert.match(trigger, /cloneAndMerge/);
  assert.match(trigger, /onOpen\("current"\)/);
  assert.match(listbox, /aria-multiselectable="true"/);
  assert.match(listbox, /internalRef\.current\?\.focus/);
  assert.match(listbox, /deferTouch: true/);
  assert.match(listbox, /ctx\.triggerRef\.current\?\.focus/);
});
