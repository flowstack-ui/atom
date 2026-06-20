import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "../../dist/index.js";

test("Table compound parts render native table anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Table.Root,
      {
        title: "Quarterly revenue",
        "data-testid": "table-root",
      },
      React.createElement(Table.Caption, null, "Revenue"),
      React.createElement(
        Table.Header,
        null,
        React.createElement(
          Table.Row,
          null,
          React.createElement(Table.Head, { sortDirection: "ascending" }, "Month"),
          React.createElement(Table.Head, null, "Revenue"),
        ),
      ),
      React.createElement(
        Table.Body,
        null,
        React.createElement(
          Table.Row,
          { "data-testid": "jan-row" },
          React.createElement(Table.Head, { scope: "row" }, "January"),
          React.createElement(Table.Cell, { colSpan: 2 }, "$100"),
        ),
      ),
      React.createElement(
        Table.Footer,
        null,
        React.createElement(
          Table.Row,
          null,
          React.createElement(TableCell, { colSpan: 3 }, "Total"),
        ),
      ),
    ),
  );

  assert.match(html, /^<table/);
  assert.match(html, /title="Quarterly revenue"/);
  assert.match(html, /data-testid="table-root"/);
  assert.match(html, /data-slot="table"/);
  assert.match(html, /<caption data-slot="table-caption">Revenue<\/caption>/);
  assert.match(html, /<thead data-slot="table-header">/);
  assert.match(html, /<tbody data-slot="table-body">/);
  assert.match(html, /<tfoot data-slot="table-footer">/);
  assert.match(html, /<tr data-testid="jan-row" data-slot="table-row">/);
  assert.match(html, /<th(?=[^>]*scope="col")(?=[^>]*aria-sort="ascending")(?=[^>]*data-slot="table-head")(?=[^>]*data-sort="ascending")[^>]*>Month<\/th>/);
  assert.match(html, /<th(?=[^>]*scope="row")(?=[^>]*data-slot="table-head")[^>]*>January<\/th>/);
  assert.match(html, /<td colSpan="2" data-slot="table-cell">\$100<\/td>/);
  assert.equal(Table.Root, TableRoot);
  assert.equal(Table.Header, TableHeader);
  assert.equal(Table.Body, TableBody);
  assert.equal(Table.Footer, TableFooter);
  assert.equal(Table.Row, TableRow);
  assert.equal(Table.Head, TableHead);
  assert.equal(Table.Cell, TableCell);
  assert.equal(Table.Caption, TableCaption);
});

test("Table parts support slot overrides and render escapes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TableRoot,
      { render: "table", "data-slot": "custom-table" },
      React.createElement(
        TableHeader,
        { "data-slot": "custom-header" },
        React.createElement(
          TableRow,
          null,
          React.createElement(
            TableHead,
            {
              render: React.createElement("th", { className: "consumer-head" }),
              sortDirection: "descending",
            },
            "Name",
          ),
        ),
      ),
      React.createElement(
        TableBody,
        null,
        React.createElement(
          TableRow,
          null,
          React.createElement(TableCell, { "data-slot": "custom-cell" }, "Ada"),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="custom-table"/);
  assert.match(html, /data-slot="custom-header"/);
  assert.match(html, /class="consumer-head"/);
  assert.match(html, /aria-sort="descending"/);
  assert.match(html, /data-sort="descending"/);
  assert.match(html, /data-slot="custom-cell"/);
});

test("Table barrels do not create a client boundary", async () => {
  const headSource = await readFile(
    new URL("src/primitives/table/TableHead.tsx", packageRoot),
    "utf8",
  );
  const primitiveIndexSource = await readFile(
    new URL("src/primitives/table/index.ts", packageRoot),
    "utf8",
  );
  const subpathSource = await readFile(
    new URL("src/table.ts", packageRoot),
    "utf8",
  );

  assert.match(headSource, /if \(asChild\) \{\s*return cloneAndMerge\(children, behaviorProps\);/s);
  assert.match(headSource, /return renderElement\(render, "th", \{\s*\.\.\.behaviorProps,\s*scope,/s);
  assert.doesNotMatch(primitiveIndexSource, /^"use client";/);
  assert.doesNotMatch(subpathSource, /^"use client";/);
});
