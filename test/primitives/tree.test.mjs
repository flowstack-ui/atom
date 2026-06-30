import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
} from "../../dist/index.js";

test("Tree compound parts render hierarchical tree anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Tree.Root,
      {
        value: "docs",
        expandedValue: ["docs"],
        name: "section",
        required: true,
        invalid: true,
        "aria-label": "Documentation",
      },
      React.createElement(
        Tree.Item,
        { value: "docs", expandable: true },
        React.createElement(Tree.ItemText, null, "Docs"),
        React.createElement(
          Tree.Group,
          null,
          React.createElement(Tree.Item, { value: "guide" }, "Guide"),
          React.createElement(Tree.Item, { value: "api", disabled: true }, "API"),
        ),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="tree"/);
  assert.match(html, /aria-label="Documentation"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /data-slot="tree"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /role="treeitem"/);
  assert.match(html, /data-slot="tree-item"/);
  assert.match(html, /data-value="docs"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-level="1"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /data-expanded=""/);
  assert.match(html, /data-slot="tree-item-text"/);
  assert.match(html, /role="group"/);
  assert.match(html, /data-slot="tree-group"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /data-value="guide"/);
  assert.match(html, /aria-level="2"/);
  assert.match(html, /data-value="api"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /<input type="hidden"/);
  assert.match(html, /name="section"/);
  assert.match(html, /value="docs"/);
  assert.equal(Tree.Root, TreeRoot);
  assert.equal(Tree.Item, TreeItem);
  assert.equal(Tree.ItemText, TreeItemText);
  assert.equal(Tree.Group, TreeGroup);
});

test("Tree supports multiple selection, collapsed groups, and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TreeRoot,
      {
        multiple: true,
        defaultValue: ["one", "two"],
        name: "nodes",
        render: "section",
        orientation: "horizontal",
      },
      React.createElement(
        TreeItem,
        {
          value: "one",
          expandable: true,
          render: React.createElement("div", { className: "custom-node" }),
        },
        "One",
        React.createElement(
          TreeGroup,
          { forceMount: true },
          React.createElement(TreeItem, { value: "child" }, "Child"),
        ),
      ),
      React.createElement(TreeItem, { value: "two" }, "Two"),
    ),
  );

  assert.match(html, /^<section/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /data-multiple=""/);
  assert.match(html, /class="custom-node"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /hidden=""/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /name="nodes" value="one"/);
  assert.match(html, /name="nodes" value="two"/);
});

test("Tree source uses Collection and keeps APG tree keyboard behavior in Root", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/tree/TreeRoot.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/tree/TreeItem.tsx", packageRoot),
    "utf8",
  );
  const itemTextSource = await readFile(
    new URL("src/primitives/tree/TreeItemText.tsx", packageRoot),
    "utf8",
  );
  const groupSource = await readFile(
    new URL("src/primitives/tree/TreeGroup.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLElement, TreeItemData>\(\)/);
  assert.match(rootSource, /role: "tree"/);
  assert.match(rootSource, /aria-activedescendant/);
  assert.match(rootSource, /case "ArrowRight"/);
  assert.match(rootSource, /case "ArrowLeft"/);
  assert.match(rootSource, /case "Home"/);
  assert.match(rootSource, /case "End"/);
  assert.match(rootSource, /lastActiveValueRef/);
  assert.match(rootSource, /expandedValuesRef/);
  assert.match(rootSource, /toggleExpandedValue\(activeValue\)/);
  assert.match(rootSource, /direction === "next" \? 0 : enabledItems\.length - 1/);
  assert.match(rootSource, /const isAltGr = event\.ctrlKey && event\.altKey/);
  assert.match(rootSource, /getTreeTypeaheadMatch\(/);
  assert.match(rootSource, /createVisibilityPredicate/);
  assert.match(rootSource, /const expandedSet = new Set\(expandedValues\)/);
  assert.match(rootSource, /Array\.isArray\(selectedValue\)/);
  assert.match(itemSource, /role: "treeitem"/);
  assert.match(itemSource, /aria-expanded/);
  assert.match(itemSource, /aria-level/);
  assert.match(itemSource, /registeredTextValue/);
  assert.match(itemSource, /activeValueRef/);
  assert.match(itemSource, /eventTargetsCurrentItem/);
  assert.match(itemSource, /updateItem\(value, itemData, isDisabled\)/);
  assert.match(itemTextSource, /textContent\?\.trim\(\)/);
  assert.match(groupSource, /role: "group"/);
  assert.match(groupSource, /"aria-hidden": forceMount && !expanded \? "true" : undefined/);
  assert.doesNotMatch(rootSource, /className/);
});
