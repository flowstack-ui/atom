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
