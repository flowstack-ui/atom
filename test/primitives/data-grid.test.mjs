import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  DataGrid,
  DataGridBody,
  DataGridCaption,
  DataGridCell,
  DataGridColumnHeader,
  DataGridFooter,
  DataGridHeader,
  DataGridRoot,
  DataGridRow,
} from "../../dist/index.js";

test("DataGrid compound parts render ARIA grid anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DataGrid.Root,
      {
        "aria-label": "Orders",
        rowCount: 2,
        columnCount: 2,
        selectionMode: "multiple",
        defaultValue: ["order-1"],
        defaultActiveCell: { rowIndex: 2, columnIndex: 1 },
      },
      React.createElement(DataGrid.Caption, null, "Orders"),
      React.createElement(
        DataGrid.Header,
        null,
        React.createElement(
          DataGrid.Row,
          { rowIndex: 1 },
          React.createElement(DataGrid.ColumnHeader, { columnIndex: 1, sortDirection: "ascending" }, "Order"),
          React.createElement(DataGrid.ColumnHeader, { columnIndex: 2 }, "Status"),
        ),
      ),
      React.createElement(
        DataGrid.Body,
        null,
        React.createElement(
          DataGrid.Row,
          { rowIndex: 2, value: "order-1" },
          React.createElement(DataGrid.Cell, { columnIndex: 1 }, "#100"),
          React.createElement(DataGrid.Cell, { columnIndex: 2 }, "Paid"),
        ),
      ),
    ),
  );

  assert.match(html, /^<table/);
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-label="Orders"/);
  assert.match(html, /aria-colcount="2"/);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /aria-rowcount="2"/);
  assert.match(html, /data-column-count="2"/);
  assert.match(html, /data-row-count="2"/);
  assert.match(html, /data-selection-mode="multiple"/);
  assert.match(html, /<caption data-slot="data-grid-caption">Orders<\/caption>/);
  assert.match(html, /<thead role="rowgroup" data-slot="data-grid-header">/);
  assert.match(html, /<tbody role="rowgroup" data-slot="data-grid-body">/);
  assert.match(html, /<tr role="row" aria-rowindex="2" aria-selected="true" data-slot="data-grid-row" data-row-index="2" data-value="order-1" data-selected="">/);
  assert.match(html, /role="columnheader"/);
  assert.match(html, /aria-sort="ascending"/);
  assert.match(html, /data-sort="ascending"/);
  assert.match(html, /role="gridcell"/);
  assert.match(html, /data-column-index="2"/);
  assert.equal(DataGrid.Root, DataGridRoot);
  assert.equal(DataGrid.Header, DataGridHeader);
  assert.equal(DataGrid.Body, DataGridBody);
  assert.equal(DataGrid.Footer, DataGridFooter);
  assert.equal(DataGrid.Row, DataGridRow);
  assert.equal(DataGrid.ColumnHeader, DataGridColumnHeader);
  assert.equal(DataGrid.Cell, DataGridCell);
  assert.equal(DataGrid.Caption, DataGridCaption);
});

test("DataGrid parts support slot overrides and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DataGridRoot,
      {
        render: React.createElement("table", { className: "consumer-grid" }),
        "data-slot": "custom-grid",
      },
      React.createElement(
        DataGridBody,
        { render: React.createElement("tbody", { className: "consumer-body" }) },
        React.createElement(
          DataGridRow,
          { rowIndex: 1, value: "row-a", render: React.createElement("tr", { className: "consumer-row" }) },
          React.createElement(
            DataGridCell,
            {
              asChild: true,
              columnIndex: 1,
              "data-slot": "custom-grid-cell",
            },
            React.createElement("td", { className: "consumer-cell" }, "Ada"),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /^<table/);
  assert.match(html, /class="consumer-grid"/);
  assert.match(html, /data-slot="custom-grid"/);
  assert.match(html, /class="consumer-body"/);
  assert.match(html, /class="consumer-row"/);
  assert.match(html, /<td class="consumer-cell" id="[^"]+" role="gridcell" aria-colindex="1" data-slot="custom-grid-cell" data-column-index="1">Ada<\/td>/);
});

test("DataGrid cells do not announce disabled just because an index is missing", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DataGrid.Root,
      { "aria-label": "Sparse grid" },
      React.createElement(
        DataGrid.Body,
        null,
        React.createElement(
          DataGrid.Row,
          { rowIndex: 1 },
          React.createElement(DataGrid.Cell, null, "Missing column index"),
        ),
      ),
    ),
  );

  assert.match(html, /role="gridcell"/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /data-disabled=""/);
});

test("DataGrid source uses Collection and keeps keyboard navigation in Root", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/data-grid/DataGridRoot.tsx", packageRoot),
    "utf8",
  );
  const cellSource = await readFile(
    new URL("src/primitives/data-grid/DataGridCell.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLElement, DataGridCellData>\(\)/);
  assert.match(rootSource, /case "ArrowRight"/);
  assert.match(rootSource, /case "ArrowDown"/);
  assert.match(rootSource, /case "Home"/);
  assert.match(rootSource, /case "End"/);
  assert.match(rootSource, /data-focused/);
  assert.match(rootSource, /wrapRows = false/);
  assert.match(rootSource, /if \(!wrapRows\) return;/);
  assert.match(rootSource, /selectRow\(item\.data\.rowValue\)/);
  assert.match(cellSource, /registerCell\(cellValue, element, cellData, isDisabled\)/);
  assert.match(cellSource, /updateCell\(cellValue, cellData, isDisabled\)/);
  assert.match(cellSource, /focusCell\(resolvedRowIndex, resolvedColumnIndex\)/);
});
