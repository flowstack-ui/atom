import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxListbox,
  ComboboxLoading,
  ComboboxPortal,
  ComboboxRoot,
  Input,
  Label,
  Listbox,
  Portal,
  filterComboboxOptions,
} from "../../dist/index.js";

test("Combobox compound parts render combobox/listbox anatomy", () => {
  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana", disabled: true },
  ];

  const html = renderToStaticMarkup(
    React.createElement(
      Combobox.Root,
      {
        options,
        defaultValue: "apple",
        defaultInputValue: "ap",
        defaultOpen: true,
        name: "fruit",
        required: true,
        invalid: true,
      },
      React.createElement(Combobox.Input, { "aria-label": "Fruit" }),
      React.createElement(Combobox.Clear, null, "Clear"),
      React.createElement(
        Combobox.Content,
        null,
        React.createElement(
          Combobox.Listbox,
          { "aria-label": "Fruit options" },
          React.createElement(
            Combobox.Group,
            null,
            React.createElement(Combobox.Label, null, "Fruit"),
            options.map((option) =>
              React.createElement(
                Combobox.Item,
                {
                  key: option.value,
                  value: option.value,
                  label: option.label,
                  disabled: option.disabled,
                },
                option.label,
              ),
            ),
          ),
          React.createElement(Combobox.Empty, null),
          React.createElement(Combobox.Loading, null),
        ),
      ),
    ),
  );

  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="combobox-listbox-/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="combobox-input"/);
  assert.match(html, /data-slot="combobox-content"/);
  assert.match(html, /aria-label="Fruit options"[^>]+role="listbox"/);
  assert.match(html, /role="group"[^>]+aria-labelledby="[^"]+-label"/);
  assert.match(html, /data-slot="combobox-label"/);
  assert.match(html, /role="option"[^>]+aria-selected="true"[^>]+data-value="apple"/);
  assert.match(html, /role="option"[^>]+aria-disabled="true"[^>]+data-value="banana"/);
  assert.match(html, /<input type="hidden"[^>]+name="fruit"[^>]+value="apple"/);
  assert.equal(Combobox.Root, ComboboxRoot);
  assert.equal(Combobox.Input, ComboboxInput);
  assert.equal(Combobox.Clear, ComboboxClear);
  assert.equal(Combobox.Portal, ComboboxPortal);
  assert.equal(Combobox.Content, ComboboxContent);
  assert.equal(Combobox.Listbox, ComboboxListbox);
  assert.equal(Combobox.Group, ComboboxGroup);
  assert.equal(Combobox.Label, ComboboxLabel);
  assert.equal(Combobox.Item, ComboboxItem);
  assert.equal(Combobox.Empty, ComboboxEmpty);
  assert.equal(Combobox.Loading, ComboboxLoading);
});

test("ComboboxLabel renders a native input label outside option groups", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Combobox.Root,
      {
        options: [{ value: "apple", label: "Apple" }],
      },
      React.createElement(Combobox.Label, null, "Fruit"),
      React.createElement(Combobox.Input, null),
    ),
  );

  assert.match(html, /<label/);
  assert.match(html, /for="combobox-input-/);
  assert.match(html, /data-slot="combobox-label"/);
});

test("Combobox helpers filter options by label or value", () => {
  assert.deepEqual(
    filterComboboxOptions(
      [
        { value: "ny", label: "New York" },
        { value: "sf", label: "San Francisco" },
        { value: "la" },
      ],
      "new",
    ),
    [{ value: "ny", label: "New York" }],
  );
  assert.deepEqual(filterComboboxOptions([{ value: "la" }], "la"), [{ value: "la" }]);
});

test("ComboboxRoot source uses Collection for mounted item registration", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/combobox/ComboboxRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLElement, ComboboxItemData>\(\)/);
  assert.match(rootSource, /version: registryVersion/);
  assert.match(rootSource, /registerCollectionItem/);
  assert.doesNotMatch(rootSource, /itemMapRef/);
  assert.doesNotMatch(rootSource, /setRegistryVersion/);
  assert.doesNotMatch(rootSource, /compareDocumentPosition/);
});

test("ComboboxInput Escape closes first, then clears when closed", async () => {
  const inputSource = await readFile(
    new URL("src/primitives/combobox/ComboboxInput.tsx", packageRoot),
    "utf8",
  );

  assert.match(inputSource, /case "Escape": \{/);
  assert.match(inputSource, /if \(isOpen\) \{\s*event\.preventDefault\(\);\s*onClose\(\);/);
  assert.match(inputSource, /else if \(value !== null \|\| inputValue !== ""\) \{\s*event\.preventDefault\(\);\s*clearSelection\(\);/);
  assert.match(inputSource, /clearSelection,/);
  assert.match(inputSource, /value,/);
});

test("ComboboxContent keeps highlighted item scrolling inside the combobox", async () => {
  const contentSource = await readFile(
    new URL("src/primitives/combobox/ComboboxContent.tsx", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(contentSource, /scrollIntoView/);
  assert.match(contentSource, /function scrollComboboxItemIntoView/);
  assert.match(contentSource, /scrollParent\.scrollTop \+= itemTop/);
  assert.match(contentSource, /scrollParent\.scrollTop \+= itemBottom - scrollParent\.clientHeight/);
});
