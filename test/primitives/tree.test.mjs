import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Direction,
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
} from "../../dist/index.js";

import {
  getTreeNavigationAction,
} from "../../dist/_internal/primitives/tree/TreeRoot.js";

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
  assert.match(html, /^<div[^>]+dir="ltr"/);
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

test("TreeRoot resolves local and provider direction", () => {
  const children = React.createElement(TreeItem, { value: "docs" }, "Docs");
  const localHtml = renderToStaticMarkup(
    React.createElement(TreeRoot, { "aria-label": "Documentation", dir: "rtl" }, children),
  );
  const providerHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(TreeRoot, { "aria-label": "Documentation" }, children),
    ),
  );
  const overrideHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(TreeRoot, { "aria-label": "Documentation", dir: "ltr" }, children),
    ),
  );

  assert.match(localHtml, /^<div[^>]+dir="rtl"/);
  assert.match(providerHtml, /^<div[^>]+dir="rtl"/);
  assert.match(overrideHtml, /^<div[^>]+dir="ltr"/);
});

test("TreeRoot applies resolved direction through render and asChild", () => {
  const renderedHtml = renderToStaticMarkup(
    React.createElement(
      TreeRoot,
      {
        dir: "rtl",
        render: React.createElement("section", { className: "consumer-tree" }),
      },
      React.createElement(TreeItem, { value: "docs" }, "Docs"),
    ),
  );
  const asChildHtml = renderToStaticMarkup(
    React.createElement(
      TreeRoot,
      { dir: "rtl", asChild: true },
      React.createElement(
        "section",
        { className: "consumer-tree" },
        React.createElement(TreeItem, { value: "docs" }, "Docs"),
      ),
    ),
  );

  assert.match(renderedHtml, /^<section class="consumer-tree"[^>]+dir="rtl"/);
  assert.match(asChildHtml, /^<section class="consumer-tree"[^>]+dir="rtl"/);
});

test("Tree arrow navigation mirrors in RTL", () => {
  assert.equal(getTreeNavigationAction("horizontal", "ArrowRight"), "next");
  assert.equal(getTreeNavigationAction("horizontal", "ArrowRight", "ltr"), "next");
  assert.equal(getTreeNavigationAction("horizontal", "ArrowLeft", "ltr"), "previous");
  assert.equal(getTreeNavigationAction("horizontal", "ArrowRight", "rtl"), "previous");
  assert.equal(getTreeNavigationAction("horizontal", "ArrowLeft", "rtl"), "next");
  assert.equal(getTreeNavigationAction("horizontal", "ArrowDown", "rtl"), null);
  assert.equal(getTreeNavigationAction("vertical", "ArrowDown", "rtl"), "next");
  assert.equal(getTreeNavigationAction("vertical", "ArrowUp", "rtl"), "previous");
  assert.equal(getTreeNavigationAction("vertical", "ArrowRight", "ltr"), "expand-or-child");
  assert.equal(getTreeNavigationAction("vertical", "ArrowLeft", "ltr"), "collapse-or-parent");
  assert.equal(getTreeNavigationAction("vertical", "ArrowRight", "rtl"), "collapse-or-parent");
  assert.equal(getTreeNavigationAction("vertical", "ArrowLeft", "rtl"), "expand-or-child");
  assert.equal(getTreeNavigationAction("vertical", "Home", "rtl"), null);
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
  assert.match(rootSource, /useDirection\(\)/);
  assert.match(rootSource, /role: "tree"/);
  assert.match(rootSource, /aria-activedescendant/);
  assert.match(rootSource, /getTreeNavigationAction\(orientation, event\.key, dir\)/);
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
  assert.match(itemSource, /target\.closest\('\[role="group"\]'\)/);
  assert.match(itemSource, /element\.contains\(closestGroup\)/);
  assert.match(itemSource, /updateItem\(value, itemData, isDisabled\)/);
  assert.match(itemTextSource, /textContent\?\.trim\(\)/);
  assert.match(groupSource, /role: "group"/);
  assert.match(groupSource, /"aria-hidden": forceMount && !expanded \? "true" : undefined/);
  assert.doesNotMatch(rootSource, /className/);
});
