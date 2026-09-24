import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { TreeGrid } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    pretendToBeVisual: true,
    url: "https://example.test/",
  });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    Node: globalThis.Node,
    Event: globalThis.Event,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLElement.prototype.scrollIntoView = () => undefined;

  return {
    container: dom.window.document.getElementById("root"),
    async cleanup(root) {
      await React.act(async () => root.unmount());
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

function fixture(expandedValue, onAction = () => {}) {
  return React.createElement(
    TreeGrid.Root,
    {
      "aria-label": "Projects",
      expandedValue,
      defaultActiveCell: { rowIndex: 3, columnIndex: 2 },
    },
    React.createElement(
      TreeGrid.Header,
      null,
      React.createElement(
        TreeGrid.Row,
        { value: "headers", rowIndex: 1 },
        React.createElement(TreeGrid.ColumnHeader, { columnIndex: 1, onAction }, "Name"),
        React.createElement(TreeGrid.ColumnHeader, { columnIndex: 2 }, "Status"),
      ),
    ),
    React.createElement(
      TreeGrid.Body,
      null,
      React.createElement(
        TreeGrid.Row,
        { value: "parent", rowIndex: 2, expandable: true },
        React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "Parent"),
        React.createElement(TreeGrid.Cell, { columnIndex: 2 }, "Open"),
      ),
      React.createElement(
        TreeGrid.Row,
        { value: "child", parentValue: "parent", rowIndex: 3, level: 2 },
        React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "Child"),
        React.createElement(TreeGrid.Cell, { columnIndex: 2 }, "Ready"),
      ),
    ),
  );
}

test("TreeGrid establishes an initial cell and recovers disabled active cells", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  const render = (disabled = false) => React.createElement(TreeGrid.Root, { 'aria-label': 'Records' },
    React.createElement(TreeGrid.Body, null,
      React.createElement(TreeGrid.Row, { value: 'one', rowIndex: 1 },
        React.createElement(TreeGrid.RowHeader, { columnIndex: 1, disabled }, 'One'),
        React.createElement(TreeGrid.Cell, { columnIndex: 2 }, 'Ready'))));
  try {
    await React.act(async () => root.render(render()));
    const grid = environment.container.querySelector('[role=treegrid]');
    const first = environment.container.querySelector('[aria-colindex="1"]');
    const second = environment.container.querySelector('[aria-colindex="2"]');
    await React.act(async () => grid.focus());
    assert.equal(grid.getAttribute('aria-activedescendant'), first.id);
    await React.act(async () => root.render(render(true)));
    assert.equal(grid.getAttribute('aria-activedescendant'), second.id);
  } finally { await environment.cleanup(root); }
});

test("TreeGrid relocates a hidden active descendant to the collapsed ancestor tree cell", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  try {
    await React.act(async () => root.render(fixture(["parent"])));
    const treeGrid = environment.container.querySelector('[role="treegrid"]');
    const childCell = environment.container.querySelector('[data-value="child"] [aria-colindex="2"]');
    assert.equal(treeGrid.getAttribute("aria-activedescendant"), childCell.id);

    await React.act(async () => root.render(fixture([])));
    const parentTreeCell = environment.container.querySelector('[data-value="parent"] [aria-colindex="1"]');
    assert.equal(treeGrid.getAttribute("aria-activedescendant"), parentTreeCell.id);
    assert.equal(environment.container.querySelector('[data-value="child"]').hidden, true);
  } finally {
    await environment.cleanup(root);
  }
});

test("TreeGrid actionable headers have equivalent pointer and Enter activation", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  let actions = 0;
  try {
    await React.act(async () => root.render(fixture(["parent"], () => { actions += 1; })));
    const treeGrid = environment.container.querySelector('[role="treegrid"]');
    const header = environment.container.querySelector('[data-actionable]');
    await React.act(async () => header.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
    assert.equal(actions, 1);
    await React.act(async () => treeGrid.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "Enter" })));
    assert.equal(actions, 2);
  } finally {
    await environment.cleanup(root);
  }
});

test("TreeGrid disclosure does not select its row and page navigation follows visible rows", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(TreeGrid.Root, {
      'aria-label': 'Files', selectionMode: 'multiple', selectOnRowClick: true,
      onValueChange: value => changes.push(value), pageSize: 2,
    }, React.createElement(TreeGrid.Body, null,
      React.createElement(TreeGrid.Row, { value: 'parent', rowIndex: 1, expandable: true },
        React.createElement(TreeGrid.RowHeader, { columnIndex: 1, expandOnClick: false },
          React.createElement(TreeGrid.Trigger, null, 'Expand'), 'Parent')),
      React.createElement(TreeGrid.Row, { value: 'child', parentValue: 'parent', rowIndex: 2, level: 2 },
        React.createElement(TreeGrid.Cell, { columnIndex: 1 }, 'Child')),
      React.createElement(TreeGrid.Row, { value: 'last', rowIndex: 3 },
        React.createElement(TreeGrid.Cell, { columnIndex: 1 }, 'Last'))))));
    const grid = environment.container.querySelector('[role=treegrid]');
    await React.act(async () => environment.container.querySelector('button').click());
    assert.equal(environment.container.querySelector('[data-value=child]').hidden, false);
    assert.equal(changes.length, 0);
    await React.act(async () => grid.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'PageDown' })));
    assert.equal(grid.getAttribute('aria-activedescendant'), environment.container.querySelector('[data-value=last] [role=gridcell]').id);
    await React.act(async () => grid.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'a', ctrlKey: true })));
    assert.deepEqual(changes.at(-1), ['parent', 'child', 'last']);
  } finally { await environment.cleanup(root); }
});

test("TreeGrid F2 enters a cell control and Escape returns to grid navigation", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  try {
    await React.act(async () => root.render(React.createElement(TreeGrid.Root, { 'aria-label': 'Editable files' },
      React.createElement(TreeGrid.Body, null, React.createElement(TreeGrid.Row, { value: 'file', rowIndex: 1 },
        React.createElement(TreeGrid.Cell, { columnIndex: 1, interactive: true }, React.createElement('button', null, 'Rename')))))));
    const grid = environment.container.querySelector('[role=treegrid]');
    const button = environment.container.querySelector('button');
    button.getClientRects = () => [{ width: 20, height: 20 }];
    await React.act(async () => grid.focus());
    assert.equal(button.tabIndex, -1);
    await React.act(async () => grid.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'F2' })));
    assert.equal(document.activeElement, button);
    assert.equal(grid.hasAttribute('aria-activedescendant'), false);
    await React.act(async () => button.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })));
    assert.equal(document.activeElement, grid);
    assert.equal(button.tabIndex, -1);
  } finally { await environment.cleanup(root); }
});

test("TreeGrid header Enter sorts while F2 enters an RTL-aware resize handle", async () => {
  const environment = installDom();
  const root = createRoot(environment.container);
  let actions = 0;
  const widths = [];
  try {
    await React.act(async () => root.render(React.createElement(TreeGrid.Root, { 'aria-label': 'Resize files', dir: 'rtl' },
      React.createElement(TreeGrid.Header, null, React.createElement(TreeGrid.Row, { value: 'head', rowIndex: 1, selectable: false },
        React.createElement(TreeGrid.ColumnHeader, { columnIndex: 1, interactive: true, onAction: () => actions++ },
          'Name', React.createElement(TreeGrid.ColumnResizeHandle, { 'aria-label': 'Resize name', defaultValue: 160, onValueChange: value => widths.push(value) })))))));
    const grid = environment.container.querySelector('[role=treegrid]');
    const handle = environment.container.querySelector('[role=separator]');
    handle.getClientRects = () => [{ width: 8, height: 40 }];
    await React.act(async () => grid.focus());
    await React.act(async () => grid.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })));
    assert.equal(actions, 1);
    await React.act(async () => grid.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'F2' })));
    assert.equal(document.activeElement, handle);
    await React.act(async () => handle.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' })));
    assert.equal(widths.at(-1), 170);
    await React.act(async () => handle.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })));
    assert.equal(document.activeElement, grid);
  } finally { await environment.cleanup(root); }
});
