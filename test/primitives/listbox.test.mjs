import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Label,
  Listbox,
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxOptionText,
  ListboxRoot,
} from "../../dist/index.js";

test("Listbox compound parts render single-select listbox anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Listbox.Root,
      {
        value: "two",
        name: "choice",
        required: true,
        invalid: true,
        "aria-label": "Choices",
      },
      React.createElement(Listbox.Option, { value: "one" }, "One"),
      React.createElement(
        Listbox.Option,
        { value: "two" },
        React.createElement(Listbox.OptionText, null, "Two"),
      ),
      React.createElement(Listbox.Option, { value: "three", disabled: true }, "Three"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /aria-label="Choices"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /data-slot="listbox"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /role="option"/);
  assert.match(html, /data-slot="listbox-option"/);
  assert.match(html, /data-value="two"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-selected=""/);
  assert.match(html, /data-slot="listbox-option-text"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /<input type="hidden"/);
  assert.match(html, /name="choice"/);
  assert.match(html, /value="two"/);
  assert.equal(Listbox.Root, ListboxRoot);
  assert.equal(Listbox.Option, ListboxOption);
  assert.equal(Listbox.OptionText, ListboxOptionText);
});

test("Listbox supports multiple selection, groups, labels, and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ListboxRoot,
      {
        multiple: true,
        defaultValue: ["alpha", "beta"],
        name: "tags",
        render: "section",
        orientation: "horizontal",
      },
      React.createElement(
        ListboxGroup,
        null,
        React.createElement(ListboxLabel, null, "Group A"),
        React.createElement(ListboxOption, {
          value: "alpha",
          render: React.createElement("div", { className: "custom-option" }),
        }, "Alpha"),
        React.createElement(ListboxOption, { value: "beta" }, "Beta"),
      ),
    ),
  );

  assert.match(html, /^<section/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /data-multiple=""/);
  assert.match(html, /role="group"/);
  assert.match(html, /data-slot="listbox-label"/);
  assert.match(html, /class="custom-option"/);
  assert.match(html, /name="tags" value="alpha"/);
  assert.match(html, /name="tags" value="beta"/);
  assert.equal(Listbox.Group, ListboxGroup);
  assert.equal(Listbox.Label, ListboxLabel);
});

test("Listbox keeps single-select form output and disabled focus semantics stable", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ListboxRoot,
      {
        name: "status",
        disabled: true,
        "aria-label": "Status",
      },
      React.createElement(ListboxOption, { value: "draft" }, "Draft"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /<input type="hidden"/);
  assert.match(html, /name="status"/);
  assert.match(html, /value=""/);
  assert.match(html, /disabled=""/);
});

test("Listbox source uses Collection and keeps keyboard behavior in Root", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/listbox/ListboxRoot.tsx", packageRoot),
    "utf8",
  );
  const optionSource = await readFile(
    new URL("src/primitives/listbox/ListboxOption.tsx", packageRoot),
    "utf8",
  );
  const optionTextSource = await readFile(
    new URL("src/primitives/listbox/ListboxOptionText.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLElement, ListboxItemData>\(\)/);
  assert.match(rootSource, /role: "listbox"/);
  assert.match(rootSource, /aria-activedescendant/);
  assert.match(rootSource, /case "Home"/);
  assert.match(rootSource, /case "End"/);
  assert.match(rootSource, /getFirstItem\(true\)/);
  assert.match(rootSource, /getLastItem\(true\)/);
  assert.match(rootSource, /typeaheadBufferRef/);
  assert.match(rootSource, /const isAltGr = event\.ctrlKey && event\.altKey/);
  assert.match(rootSource, /getNextItem\(currentValue/);
  assert.match(rootSource, /const handleBlur = useCallback/);
  assert.match(rootSource, /setHighlightedValue\(null\)/);
  assert.match(rootSource, /Array\.isArray\(selectedValue\)/);
  assert.match(optionSource, /role: "option"/);
  assert.match(optionSource, /aria-selected/);
  assert.match(optionSource, /registerItem\(value, element, itemData, isDisabled\)/);
  assert.match(optionSource, /updateItem\(value, itemData, isDisabled\)/);
  assert.match(optionSource, /setHighlightedValue\(value\)/);
  assert.match(optionTextSource, /textContent\?\.trim\(\)/);
  assert.doesNotMatch(rootSource, /className/);
});
