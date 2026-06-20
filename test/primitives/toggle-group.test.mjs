import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  ToggleGroupItemRoot,
  ToggleGroupRoot,
} from "../../dist/index.js";

import {
  getToggleGroupTabStopValue,
} from "../../dist/_internal/primitives/toggle-group/ToggleGroupItemRoot.js";

import {
  getToggleGroupNavigationDirection,
} from "../../dist/_internal/primitives/toggle-group/ToggleGroupRoot.js";

test("ToggleGroupRoot renders group attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleGroupRoot,
      {
        value: "bold",
        orientation: "vertical",
        ariaLabel: "Text formatting",
        className: "group-class",
      },
      React.createElement(ToggleGroupItemRoot, { value: "bold" }, "B"),
      React.createElement(ToggleGroupItemRoot, { value: "italic" }, "I"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Text formatting"/);
  assert.match(html, /data-slot="toggle-group"/);
  assert.match(html, /data-orientation="vertical"/);
  assert.match(html, /class="group-class"/);
});

test("ToggleGroupRoot restricts arrow-key navigation by orientation", () => {
  assert.equal(getToggleGroupNavigationDirection("vertical", "ArrowDown"), 1);
  assert.equal(getToggleGroupNavigationDirection("vertical", "ArrowUp"), -1);
  assert.equal(getToggleGroupNavigationDirection("vertical", "ArrowRight"), null);
  assert.equal(getToggleGroupNavigationDirection("vertical", "ArrowLeft"), null);

  assert.equal(getToggleGroupNavigationDirection("horizontal", "ArrowRight"), 1);
  assert.equal(getToggleGroupNavigationDirection("horizontal", "ArrowLeft"), -1);
  assert.equal(getToggleGroupNavigationDirection("horizontal", "ArrowDown"), null);
  assert.equal(getToggleGroupNavigationDirection("horizontal", "ArrowUp"), null);
});

test("ToggleGroupItemRoot chooses a tabbable item when no value is selected", () => {
  const disabledValues = new Set(["bold"]);
  const getItemElement = (value) => ({
    disabled: disabledValues.has(value),
  });

  assert.equal(
    getToggleGroupTabStopValue(["bold", "italic", "underline"], [], getItemElement),
    "italic",
  );
  assert.equal(
    getToggleGroupTabStopValue(["bold", "italic", "underline"], ["underline"], getItemElement),
    "underline",
  );
});

test("ToggleGroupItemRoot renders selected and unselected item attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleGroupRoot,
      { value: ["bold"], type: "multiple", ariaLabel: "Text formatting" },
      React.createElement(ToggleGroupItemRoot, {
        value: "bold",
        ariaLabel: "Bold",
        className: "item-class",
      }),
      React.createElement(ToggleGroupItemRoot, { value: "italic", ariaLabel: "Italic", disabled: true }),
    ),
  );

  assert.doesNotMatch(html, /role="button"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-label="Bold"/);
  assert.match(html, /data-state="on"/);
  assert.match(html, /data-slot="toggle-group-item"/);
  assert.match(html, /data-value="bold"/);
  assert.match(html, /class="item-class"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-state="off"/);
  assert.match(html, /data-value="italic"/);
});

test("ToggleGroupItemRoot passes native button attributes without losing group behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleGroupRoot,
      { value: "bold", ariaLabel: "Text formatting" },
      React.createElement(ToggleGroupItemRoot, {
        id: "bold-item",
        value: "bold",
        ariaLabel: "Bold",
        title: "Bold",
        "data-testid": "toggle-group-item",
        style: { color: "orange" },
      }),
    ),
  );

  assert.match(html, /id="bold-item"/);
  assert.match(html, /title="Bold"/);
  assert.match(html, /data-testid="toggle-group-item"/);
  assert.match(html, /style="color:orange"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-state="on"/);
});

test("ToggleGroupItemRoot asChild merges behavior inside group", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleGroupRoot,
      { value: "bold", ariaLabel: "Text formatting" },
      React.createElement(
        ToggleGroupItemRoot,
        {
          asChild: true,
          value: "bold",
          ariaLabel: "Bold",
          className: "root-class",
        },
        React.createElement("span", { className: "child-class" }, "B"),
      ),
    ),
  );

  assert.match(html, /<span/);
  assert.match(html, /role="button"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-state="on"/);
  assert.match(html, /data-value="bold"/);
  assert.match(html, /class="child-class root-class"/);
  assert.match(html, />B<\/span>/);
});

test("ToggleGroupItemRoot asChild preserves native button semantics without redundant role", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleGroupRoot,
      { value: "bold", ariaLabel: "Text formatting" },
      React.createElement(
        ToggleGroupItemRoot,
        {
          asChild: true,
          value: "bold",
          ariaLabel: "Bold",
        },
        React.createElement("button", null, "B"),
      ),
    ),
  );

  assert.match(html, /<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, />B<\/button>/);
});

test("ToggleGroupRoot source uses Collection for DOM-ordered item registration", async () => {
  const source = await readFile(
    new URL("src/primitives/toggle-group/ToggleGroupRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /useCollection<string, HTMLButtonElement>\(\)/);
  assert.match(source, /registerCollectionItem/);
  assert.doesNotMatch(source, /compareDocumentPosition/);
});
