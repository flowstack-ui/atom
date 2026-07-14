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
  Direction,
} from "../../dist/index.js";

import {
  getDataGridNavigationDirection,
} from "../../dist/_internal/primitives/data-grid/DataGridRoot.js";

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
  assert.match(html, /^<table[^>]+dir="ltr"/);
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
  assert.match(html, /<tr role="row" aria-rowindex="2" aria-selected="true" data-slot="data-grid-row" data-selectable="" data-row-index="2" data-value="order-1" data-selected="">/);
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

test("DataGridRoot resolves local and provider direction", () => {
  const body = React.createElement(
    DataGrid.Body,
    null,
    React.createElement(
      DataGrid.Row,
      { rowIndex: 1 },
      React.createElement(DataGrid.Cell, { columnIndex: 1 }, "Cell"),
    ),
  );
  const localHtml = renderToStaticMarkup(
    React.createElement(DataGrid.Root, { "aria-label": "Orders", dir: "rtl" }, body),
  );
  const providerHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(DataGrid.Root, { "aria-label": "Orders" }, body),
    ),
  );
  const overrideHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(DataGrid.Root, { "aria-label": "Orders", dir: "ltr" }, body),
    ),
  );

  assert.match(localHtml, /^<table[^>]+dir="rtl"/);
  assert.match(providerHtml, /^<table[^>]+dir="rtl"/);
  assert.match(overrideHtml, /^<table[^>]+dir="ltr"/);
});

test("DataGridRoot applies resolved direction through render and asChild", () => {
  const renderedHtml = renderToStaticMarkup(
    React.createElement(
      DataGridRoot,
      {
        dir: "rtl",
        render: React.createElement("table", { className: "consumer-grid" }),
      },
      React.createElement(DataGridBody, null),
    ),
  );
  const asChildHtml = renderToStaticMarkup(
    React.createElement(
      DataGridRoot,
      { dir: "rtl", asChild: true },
      React.createElement(
        "table",
        { className: "consumer-grid" },
        React.createElement(DataGridBody, null),
      ),
    ),
  );

  assert.match(renderedHtml, /^<table class="consumer-grid"[^>]+dir="rtl"/);
  assert.match(asChildHtml, /^<table class="consumer-grid"[^>]+dir="rtl"/);
});

test("DataGrid horizontal arrow navigation mirrors in RTL while vertical navigation does not", () => {
  assert.equal(getDataGridNavigationDirection("ArrowRight"), "right");
  assert.equal(getDataGridNavigationDirection("ArrowRight", "ltr"), "right");
  assert.equal(getDataGridNavigationDirection("ArrowLeft", "ltr"), "left");
  assert.equal(getDataGridNavigationDirection("ArrowRight", "rtl"), "left");
  assert.equal(getDataGridNavigationDirection("ArrowLeft", "rtl"), "right");
  assert.equal(getDataGridNavigationDirection("ArrowDown", "rtl"), "down");
  assert.equal(getDataGridNavigationDirection("ArrowUp", "rtl"), "up");
  assert.equal(getDataGridNavigationDirection("Home", "rtl"), null);
  assert.equal(getDataGridNavigationDirection("End", "rtl"), null);
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

test("DataGrid exposes row-level selection availability", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DataGrid.Root,
      {
        "aria-label": "Selectable orders",
        rowCount: 3,
        columnCount: 1,
        selectionMode: "multiple",
        defaultValue: ["order-2"],
      },
      React.createElement(
        DataGrid.Header,
        null,
        React.createElement(
          DataGrid.Row,
          { rowIndex: 1, selectable: false },
          React.createElement(DataGrid.ColumnHeader, { columnIndex: 1 }, "Order"),
        ),
      ),
      React.createElement(
        DataGrid.Body,
        null,
        React.createElement(
          DataGrid.Row,
          { rowIndex: 2, value: "order-1", selectable: false },
          React.createElement(DataGrid.Cell, { columnIndex: 1 }, "#100"),
        ),
        React.createElement(
          DataGrid.Row,
          { rowIndex: 3, value: "order-2" },
          React.createElement(DataGrid.Cell, { columnIndex: 1 }, "#200"),
        ),
      ),
    ),
  );

  assert.match(html, /<tr[^>]*data-selection-disabled=""[^>]*data-row-index="1"/);
  assert.match(html, /<tr[^>]*data-selection-disabled=""[^>]*data-value="order-1"/);
  assert.match(html, /<tr[^>]*aria-selected="true"[^>]*data-selectable=""[^>]*data-value="order-2"[^>]*data-selected=""/);
});

test("DataGrid source uses Collection and keeps keyboard navigation in Root", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/data-grid/DataGridRoot.tsx", packageRoot),
    "utf8",
  );
  const rowSource = await readFile(
    new URL("src/primitives/data-grid/DataGridRow.tsx", packageRoot),
    "utf8",
  );
  const cellSource = await readFile(
    new URL("src/primitives/data-grid/DataGridCell.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useCollection<string, HTMLElement, DataGridRowData>\(\)/);
  assert.match(rootSource, /useCollection<string, HTMLElement, DataGridCellData>\(\)/);
  assert.match(rootSource, /useDirection\(\)/);
  assert.match(rootSource, /getDataGridNavigationDirection\(event\.key, dir\)/);
  assert.match(rootSource, /case "ArrowRight"/);
  assert.match(rootSource, /case "ArrowDown"/);
  assert.match(rootSource, /case "Home"/);
  assert.match(rootSource, /case "End"/);
  assert.match(rootSource, /data-focused/);
  assert.match(rootSource, /wrapRows = false/);
  assert.match(rootSource, /if \(!wrapRows\) return;/);
  assert.match(rootSource, /for \(let offset = 1; offset < rowIndexes\.length; offset \+= 1\)/);
  assert.match(rootSource, /cell\.data\.columnIndex === current\.columnIndex/);
  assert.match(rootSource, /if \(row && !row\.data\.selectable\) return;/);
  assert.match(rootSource, /selectRow\(item\.data\.rowValue\)/);
  assert.match(rowSource, /selectable = true/);
  assert.match(rowSource, /registerRow\(value, element, rowData, isDisabled\)/);
  assert.match(rowSource, /data-selection-disabled/);
  assert.match(rowSource, /data-selectable/);
  assert.match(cellSource, /registerCell\(cellValue, element, cellData, isDisabled\)/);
  assert.match(cellSource, /updateCell\(cellValue, cellData, isDisabled\)/);
  assert.match(cellSource, /focusCell\(resolvedRowIndex, resolvedColumnIndex\)/);
});
