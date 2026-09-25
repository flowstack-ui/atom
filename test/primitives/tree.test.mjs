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
  createTreeCollection,
  useTreeContext,
  useTreeController,
} from "../../dist/index.js";

import {
  getTreeInitialActiveValue,
  getTreeNavigationAction,
} from "../../dist/_internal/primitives/tree/TreeRoot.js";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

async function withTreeDom(run) {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true, url: 'https://example.test' });
  const keys = ['window', 'document', 'HTMLElement', 'Element', 'Node', 'Event', 'IS_REACT_ACT_ENVIRONMENT'];
  const previous = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'IS_REACT_ACT_ENVIRONMENT' ? true : dom.window[key] });
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  const container = document.getElementById('root');
  const root = createRoot(container);
  try { await run(root, container); } finally {
    await React.act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
}

test('Tree descendant focus does not scroll a branch during pointer activation', async () => {
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Tree.Root, {checkable: true},
      React.createElement(Tree.Item, {value: 'branch'}, React.createElement(Tree.Checkbox, {'aria-label': 'Check branch'})))));
    let scrolls = 0;
    container.querySelector('[role=treeitem]').scrollIntoView = () => { scrolls++; };
    await React.act(async () => container.querySelector('[role=checkbox]').focus());
    assert.equal(scrolls, 0, 'focus bubbling from a control must not move it before pointerup');
    await React.act(async () => container.querySelector('[role=checkbox]').click());
    assert.equal(container.querySelector('[role=checkbox]').getAttribute('aria-checked'), 'true');
  });
});

test('Tree controller provider supplies selection and separate checked state', async () => {
  const collection = createTreeCollection([{ value: 'one', label: 'One' }]);
  let controller;
  function Demo() {
    controller = useTreeController({ collection, defaultValue: 'one', defaultCheckedValue: ['one'] });
    return React.createElement(Tree.RootProvider, { value: controller, 'aria-label': 'Provider', checkable: true },
      React.createElement(Tree.Item, { value: 'one' }, 'One'));
  }
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Demo)));
    assert.equal(container.querySelector('[role=treeitem]').getAttribute('aria-selected'), 'true');
    assert.equal(controller.getNodeState('one').checked, true);
    await React.act(async () => controller.setCheckedValue([]));
    assert.equal(controller.getNodeState('one').checked, false);
    assert.equal(controller.getNodeState('one').selected, true);
  });
});

test('Tree nonselectable branches remain navigable while range and select-all skip them', async () => {
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Tree.Root, { 'aria-label': 'Files', selectionMode: 'multiple' },
      React.createElement(Tree.Item, { value: 'branch', expandable: true, selectable: false }, 'Folder'),
      React.createElement(Tree.Item, { value: 'file' }, 'File'))));
    const tree = container.querySelector('[role=tree]');
    const branch = container.querySelector('[data-value=branch]');
    await React.act(async () => branch.click());
    assert.equal(branch.getAttribute('aria-expanded'), 'true');
    assert.equal(branch.hasAttribute('aria-selected'), false);
    assert.equal(tree.getAttribute('aria-activedescendant'), branch.id);
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true })));
    assert.equal(branch.hasAttribute('data-selected'), false);
    assert.equal(container.querySelector('[data-value=file]').getAttribute('aria-selected'), 'true');
  });
});

test('Tree pointer hover preserves keyboard focus and disabled endpoints are skipped', async () => {
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Tree.Root, { 'aria-label': 'Files' },
      ...['disabled-first', 'a', 'b', 'disabled-last'].map(value => React.createElement(Tree.Item, { key: value, value, disabled: value.startsWith('disabled') }, value)))));
    const tree = container.querySelector('[role=tree]');
    const a = container.querySelector('[data-value=a]');
    const b = container.querySelector('[data-value=b]');
    await React.act(async () => tree.focus());
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'End', bubbles: true })));
    assert.equal(tree.getAttribute('aria-activedescendant'), b.id);
    await React.act(async () => a.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true })));
    await React.act(async () => a.dispatchEvent(new window.MouseEvent('pointerout', { bubbles: true })));
    assert.equal(tree.getAttribute('aria-activedescendant'), b.id);
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true })));
    assert.equal(tree.getAttribute('aria-activedescendant'), a.id);
  });
});

test('Tree multiple selection replaces on click, toggles with modifiers and extends keyboard ranges', async () => {
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Tree.Root, { multiple: true },
      ...['a', 'b', 'c'].map(value => React.createElement(Tree.Item, { key: value, value }, value)))));
    const tree = container.querySelector('[role=tree]');
    const selected = () => [...container.querySelectorAll('[aria-selected=true]')].map(node => node.dataset.value);
    const click = async (value, modifiers = {}) => React.act(async () => container.querySelector(`[data-value=${value}]`).dispatchEvent(new window.MouseEvent('click', { bubbles: true, ...modifiers })));
    await click('a');
    await click('b', { ctrlKey: true });
    assert.deepEqual(selected(), ['a', 'b']);
    await click('c');
    assert.deepEqual(selected(), ['c']);
    await click('a', { metaKey: true });
    assert.deepEqual(selected(), ['a', 'c']);
    await click('b');
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true })));
    assert.deepEqual(selected(), ['b', 'c']);
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Home', shiftKey: true, bubbles: true })));
    assert.deepEqual(selected(), ['a', 'b']);
    await click('c', { shiftKey: true });
    assert.deepEqual(selected(), ['b', 'c']);
  });
});

test('Tree does not activate a disabled-only tree', () => {
  assert.equal(getTreeInitialActiveValue([treeEntry('disabled', { disabled: true })], []), null);
});

test('Tree recovers when its active node is removed or disabled', async () => {
  await withTreeDom(async (root, container) => {
    const fixture = (remove = false, disabled = false) => React.createElement(Tree.Root, { 'aria-label': 'Files' },
      !remove && React.createElement(Tree.Item, { value: 'a', disabled }, 'A'),
      React.createElement(Tree.Item, { value: 'b' }, 'B'));
    await React.act(async () => root.render(fixture()));
    const tree = container.querySelector('[role=tree]');
    await React.act(async () => tree.focus());
    await React.act(async () => root.render(fixture(false, true)));
    assert.equal(tree.getAttribute('aria-activedescendant'), container.querySelector('[data-value=b]').id);
    await React.act(async () => root.render(fixture(true)));
    assert.equal(tree.getAttribute('aria-activedescendant'), container.querySelector('[data-value=b]').id);
  });
});

test('Tree collection preserves ancestor paths, sibling metadata and immutable mutations', () => {
  const nodes = [{ value: 'src', label: 'Source', children: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }] }];
  const collection = createTreeCollection(nodes);
  assert.deepEqual(collection.visible([]).map(entry => entry.value), ['src']);
  assert.deepEqual(collection.visible(['src']).map(entry => entry.value), ['src', 'a', 'b']);
  assert.equal(collection.find('b').posInSet, 2);
  assert.equal(collection.find('b').setSize, 2);
  assert.deepEqual(collection.filter(node => node.label === 'Beta').entries.map(entry => entry.value), ['src', 'b']);
  assert.equal(collection.update('a', node => ({ ...node, label: 'Renamed' })).find('a').node.label, 'Renamed');
  assert.equal(collection.remove('src').entries.length, 0);
  assert.equal(nodes[0].children[0].label, 'Alpha');
  assert.throws(() => createTreeCollection([...nodes, nodes[0]]), /unique values/);
});

test('Tree checking is separate from selection and propagates over the logical collection', async () => {
  await withTreeDom(async (root, container) => {
    const collection = createTreeCollection([{ value: 'src', label: 'Source', children: [
      { value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'disabled', label: 'Disabled', disabled: true },
    ] }]);
    const values = [];
    await React.act(async () => root.render(React.createElement(Tree.Root, {
      collection, checkable: true, checkPropagation: 'descendants', defaultCheckedValue: ['a'],
      onCheckedValueChange: value => values.push(value), selectionMode: 'none', expandOnClick: false,
    }, React.createElement(Tree.Item, { value: 'src', expandable: true },
      React.createElement(Tree.ItemText, null, 'Source'), React.createElement(Tree.Trigger, null, '+'),
      React.createElement(Tree.Checkbox)))));
    const item = container.querySelector('[role=treeitem]');
    const checkbox = container.querySelector('[role=checkbox]');
    assert.equal(item.getAttribute('aria-checked'), 'mixed');
    assert.equal(item.hasAttribute('aria-selected'), false);
    await React.act(async () => checkbox.click());
    assert.deepEqual(values.at(-1), ['a', 'b']);
    assert.equal(item.getAttribute('aria-expanded'), 'false');
    await React.act(async () => container.querySelector('[data-slot=tree-trigger]').click());
    assert.equal(item.getAttribute('aria-expanded'), 'true');
    assert.equal(item.getAttribute('aria-checked'), 'true');
  });
});

test('Tree lazy loading deduplicates requests and exposes retry after failure', async () => {
  await withTreeDom(async (root, container) => {
    let reject;
    let requests = 0;
    let api;
    function Observer() { api = useTreeContext(); return null; }
    const loadChildren = () => { requests += 1; return requests === 1 ? new Promise((_, fail) => { reject = fail; }) : Promise.resolve(); };
    const fixture = () => React.createElement(Tree.Root, { defaultExpandedValue: ['remote'], loadChildren },
      React.createElement(Observer), React.createElement(Tree.Item, { value: 'remote', expandable: true }, 'Remote'));
    await React.act(async () => root.render(fixture()));
    const item = container.querySelector('[role=treeitem]');
    assert.equal(requests, 1);
    assert.equal(item.getAttribute('aria-busy'), 'true');
    await React.act(async () => root.render(fixture()));
    assert.equal(requests, 1);
    await React.act(async () => reject(new Error('Offline')));
    assert.equal(item.hasAttribute('data-load-error'), true);
    assert.equal(item.hasAttribute('aria-busy'), false);
    await React.act(async () => api.retryLoad('remote'));
    assert.equal(requests, 2);
    assert.equal(item.hasAttribute('data-load-error'), false);
  });
});

test('Tree controlled focus requests recovery only once when declined', async () => {
  await withTreeDom(async (root) => {
    const requests = [];
    const fixture = () => React.createElement(Tree.Root, { focusedValue: 'disabled', onFocusedValueChange: value => requests.push(value) },
      React.createElement(Tree.Item, { value: 'disabled', disabled: true }, 'Disabled'),
      React.createElement(Tree.Item, { value: 'enabled' }, 'Enabled'));
    await React.act(async () => root.render(fixture()));
    await React.act(async () => root.render(fixture()));
    assert.deepEqual(requests, ['enabled']);
  });
});

test('Tree aborts lazy loading when its logical branch is removed', async () => {
  await withTreeDom(async (root) => {
    let signal;
    let finish;
    let errors = 0;
    const collection = createTreeCollection([{ value: 'branch', label: 'Branch', expandable: true }]);
    const loader = (_value, options) => {
      signal = options.signal;
      return new Promise(resolve => { finish = resolve; });
    };
    const render = current => React.createElement(Tree.Root, {
      collection: current, defaultExpandedValue: ['branch'], loadChildren: loader, onLoadError: () => errors++,
    }, current.entries.map(entry => React.createElement(Tree.Item, { key: entry.value, value: entry.value, expandable: true }, entry.node.label)));
    await React.act(async () => root.render(render(collection)));
    assert.equal(signal.aborted, false);
    await React.act(async () => root.render(render(collection.remove('branch'))));
    assert.equal(signal.aborted, true);
    await React.act(async () => finish());
    assert.equal(errors, 0);
  });
});

test('Tree interactive controls keep their keys and return focus on Escape', async () => {
  await withTreeDom(async (root, container) => {
    await React.act(async () => root.render(React.createElement(Tree.Root, { 'aria-label': 'Files' },
      React.createElement(Tree.Item, { value: 'edit', interactive: true },
        React.createElement(Tree.ItemText, null, 'Editable file'), React.createElement('button', { type: 'button' }, 'Rename')))));
    const tree = container.querySelector('[role=tree]');
    const input = container.querySelector('button');
    input.getClientRects = () => [{ width: 100, height: 20 }];
    await React.act(async () => tree.focus());
    assert.equal(input.tabIndex, -1);
    await React.act(async () => tree.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'F2', bubbles: true })));
    assert.equal(document.activeElement, input);
    assert.equal(tree.hasAttribute('aria-activedescendant'), false);
    await React.act(async () => input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(document.activeElement, tree);
    assert.equal(input.tabIndex, -1);
  });
});

function treeEntry(value, { disabled = false } = {}) {
  return {
    value,
    disabled,
    element: null,
    data: {
      id: `tree-item-${value}`,
      textValue: value,
      parentValue: null,
      level: 1,
      expandable: false,
    },
  };
}

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

test("Tree initial focus prefers the first enabled visible selected item", () => {
  const visibleItems = [
    treeEntry("disabled-selected", { disabled: true }),
    treeEntry("first"),
    treeEntry("selected"),
    treeEntry("selected-later"),
  ];

  assert.equal(
    getTreeInitialActiveValue(visibleItems, ["selected-later", "selected"]),
    "selected",
  );
  assert.equal(
    getTreeInitialActiveValue(visibleItems, ["disabled-selected"]),
    "first",
  );
  assert.equal(getTreeInitialActiveValue([], ["selected"]), null);
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
  assert.match(rootSource, /getTreeInitialActiveValue\(visibleItems, selectedValues\)/);
  assert.match(rootSource, /loop = false/);
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
  assert.doesNotMatch(itemSource, /handlePointerMove|handlePointerLeave/);
  assert.match(itemSource, /eventTargetsCurrentItem/);
  assert.match(itemSource, /target\.closest\('\[role="group"\]'\)/);
  assert.match(itemSource, /element\.contains\(closestGroup\)/);
  assert.match(itemSource, /updateItem\(value, itemData, isDisabled\)/);
  assert.match(itemTextSource, /textContent\?\.trim\(\)/);
  assert.match(groupSource, /role: "group"/);
  assert.match(groupSource, /"aria-hidden": !expanded \? "true" : undefined/);
  assert.doesNotMatch(rootSource, /className/);
});
