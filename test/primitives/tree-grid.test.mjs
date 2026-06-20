import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  TreeGrid,
  TreeGridBody,
  TreeGridCaption,
  TreeGridCell,
  TreeGridColumnHeader,
  TreeGridHeader,
  TreeGridRoot,
  TreeGridRow,
  TreeGridRowHeader,
} from "../../dist/index.js";

test("TreeGrid compound parts render hierarchical grid anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TreeGrid.Root,
      {
        "aria-label": "Projects",
        rowCount: 3,
        columnCount: 2,
        selectionMode: "multiple",
        defaultValue: ["api"],
        defaultExpandedValue: ["platform"],
      },
      React.createElement(TreeGrid.Caption, null, "Projects"),
      React.createElement(
        TreeGrid.Header,
        null,
        React.createElement(
          TreeGrid.Row,
          { value: "header", rowIndex: 1 },
          React.createElement(TreeGrid.ColumnHeader, { columnIndex: 1 }, "Name"),
          React.createElement(TreeGrid.ColumnHeader, { columnIndex: 2, sortDirection: "ascending" }, "Status"),
        ),
      ),
      React.createElement(
        TreeGrid.Body,
        null,
        React.createElement(
          TreeGrid.Row,
          { value: "platform", rowIndex: 2, expandable: true, level: 1 },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "Platform"),
          React.createElement(TreeGrid.Cell, { columnIndex: 2 }, "Active"),
        ),
        React.createElement(
          TreeGrid.Row,
          { value: "api", parentValue: "platform", rowIndex: 3, level: 2 },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "API"),
          React.createElement(TreeGrid.Cell, { columnIndex: 2 }, "Active"),
        ),
      ),
    ),
  );

  assert.match(html, /^<table/);
  assert.match(html, /role="treegrid"/);
  assert.match(html, /aria-label="Projects"/);
  assert.match(html, /aria-colcount="2"/);
  assert.match(html, /aria-rowcount="3"/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /data-slot="tree-grid"/);
  assert.match(html, /<caption data-slot="tree-grid-caption">Projects<\/caption>/);
  assert.match(html, /<thead role="rowgroup" data-slot="tree-grid-header">/);
  assert.match(html, /<tbody role="rowgroup" data-slot="tree-grid-body">/);
  assert.match(html, /role="row"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-level="1"/);
  assert.match(html, /aria-level="2"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /role="rowheader"/);
  assert.match(html, /role="gridcell"/);
  assert.match(html, /role="columnheader"/);
  assert.match(html, /aria-sort="ascending"/);
  assert.equal(TreeGrid.Root, TreeGridRoot);
  assert.equal(TreeGrid.Header, TreeGridHeader);
  assert.equal(TreeGrid.Body, TreeGridBody);
  assert.equal(TreeGrid.Row, TreeGridRow);
  assert.equal(TreeGrid.ColumnHeader, TreeGridColumnHeader);
  assert.equal(TreeGrid.RowHeader, TreeGridRowHeader);
  assert.equal(TreeGrid.Cell, TreeGridCell);
  assert.equal(TreeGrid.Caption, TreeGridCaption);
});

test("TreeGrid hides descendant rows when parent rows are collapsed", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TreeGrid.Root,
      {
        "aria-label": "Collapsed projects",
        rowCount: 2,
        columnCount: 1,
        defaultExpandedValue: [],
      },
      React.createElement(
        TreeGrid.Body,
        null,
        React.createElement(
          TreeGrid.Row,
          { value: "platform", rowIndex: 1, expandable: true, level: 1 },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "Platform"),
        ),
        React.createElement(
          TreeGrid.Row,
          { value: "api", parentValue: "platform", rowIndex: 2, level: 2 },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "API"),
        ),
      ),
    ),
  );

  assert.match(html, /<tr[^>]*aria-expanded="false"[^>]*data-value="platform"/);
  assert.match(html, /<tr[^>]*aria-hidden="true"[^>]*data-hidden=""[^>]*hidden=""[^>]*data-value="api"/);
});

test("TreeGrid exposes row-level selection availability", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TreeGrid.Root,
      {
        "aria-label": "Selectable projects",
        rowCount: 2,
        columnCount: 1,
        selectionMode: "multiple",
        defaultValue: ["api"],
      },
      React.createElement(
        TreeGrid.Body,
        null,
        React.createElement(
          TreeGrid.Row,
          { value: "platform", rowIndex: 1, expandable: true, selectable: false },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "Platform"),
        ),
        React.createElement(
          TreeGrid.Row,
          { value: "api", rowIndex: 2 },
          React.createElement(TreeGrid.RowHeader, { columnIndex: 1 }, "API"),
        ),
      ),
    ),
  );

  assert.match(html, /<tr[^>]*data-selection-disabled=""[^>]*data-value="platform"/);
  assert.match(html, /<tr[^>]*aria-selected="true"[^>]*data-selectable=""[^>]*data-selected=""[^>]*data-value="api"/);
});

test("TreeGrid source combines tree expansion with grid keyboard navigation", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/tree-grid/TreeGridRoot.tsx", packageRoot),
    "utf8",
  );
  const rowSource = await readFile(
    new URL("src/primitives/tree-grid/TreeGridRow.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /role: "treegrid"/);
  assert.match(rootSource, /useCollection<string, HTMLElement, TreeGridRowData>\(\)/);
  assert.match(rootSource, /useCollection<string, HTMLElement, TreeGridCellData>\(\)/);
  assert.match(rootSource, /case "ArrowRight"/);
  assert.match(rootSource, /case "ArrowLeft"/);
  assert.match(rootSource, /activeCellIsTreeColumn/);
  assert.match(rootSource, /activeRowCanExpand/);
  assert.match(rootSource, /case "Enter"/);
  assert.match(rootSource, /toggleExpandedRow\(activeRow\.value\)/);
  assert.match(rootSource, /case " ":/);
  assert.match(rootSource, /!row\.data\.selectable/);
  assert.match(rootSource, /if \(!rowValue \|\| disabled\) return;/);
  assert.match(rootSource, /expandedValues/);
  assert.match(rootSource, /aria-activedescendant/);
  assert.match(rowSource, /aria-expanded/);
  assert.match(rowSource, /aria-level/);
  assert.match(rowSource, /updateRow\(value, rowData, isDisabled\)/);
  assert.doesNotMatch(rootSource, /className/);
});
