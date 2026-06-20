import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  List,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  getPaginationRange,
} from "../../dist/index.js";

test("Pagination compound parts render nav, current page, controls, and ellipsis", () => {
  const items = getPaginationRange({
    totalPages: 20,
    currentPage: 10,
    siblingCount: 1,
    boundaryCount: 1,
  });

  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 20,
        defaultPage: 10,
        "aria-label": "Pages",
      },
      React.createElement(
        Pagination.List,
        null,
        React.createElement("li", null, React.createElement(Pagination.Previous, null, "Prev")),
        items.map((item, index) =>
          item === "ellipsis"
            ? React.createElement(
                "li",
                { key: `ellipsis-${index}` },
                React.createElement(Pagination.Ellipsis, null),
              )
            : React.createElement(
                "li",
                { key: item },
                React.createElement(Pagination.Item, { page: item }),
              ),
        ),
        React.createElement("li", null, React.createElement(Pagination.Next, null, "Next")),
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /aria-label="Pages"/);
  assert.match(html, /data-slot="pagination-root"/);
  assert.match(html, /<ol data-slot="pagination-list"/);
  assert.match(html, /data-slot="pagination-previous"/);
  assert.match(html, /data-direction="previous"/);
  assert.match(html, /aria-current="page"[^>]+data-state="active"[^>]+data-page="10"/);
  assert.match(html, /aria-label="Go to page 9"/);
  assert.match(html, /aria-hidden="true" data-slot="pagination-ellipsis"/);
  assert.match(html, /data-slot="pagination-next"/);
  assert.equal(Pagination.Root, PaginationRoot);
  assert.equal(Pagination.List, PaginationList);
  assert.equal(Pagination.Previous, PaginationPrevious);
  assert.equal(Pagination.Item, PaginationItem);
  assert.equal(Pagination.Ellipsis, PaginationEllipsis);
  assert.equal(Pagination.Next, PaginationNext);
});

test("Pagination helpers clamp ranges and include boundary ellipsis", () => {
  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 1,
      boundaryCount: 1,
    }),
    [1, "ellipsis", 9, 10, 11, "ellipsis", 20],
  );
  assert.deepEqual(getPaginationRange({ totalPages: 4, currentPage: 99 }), [1, 2, 3, 4]);
});

test("Pagination helpers keep a stable range count for the configured density", () => {
  const defaultRanges = Array.from({ length: 10 }, (_, index) =>
    getPaginationRange({ totalPages: 10, currentPage: index + 1 }),
  );

  assert.deepEqual(defaultRanges, [
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, "ellipsis", 4, 5, 6, "ellipsis", 10],
    [1, "ellipsis", 5, 6, 7, "ellipsis", 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
  ]);
  assert.deepEqual(
    defaultRanges.map((range) => range.length),
    Array.from({ length: 10 }, () => 7),
  );

  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 0,
      boundaryCount: 1,
    }),
    [1, "ellipsis", 10, "ellipsis", 20],
  );
  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 1,
      boundaryCount: 2,
    }),
    [1, 2, "ellipsis", 9, 10, 11, "ellipsis", 19, 20],
  );
});

test("PaginationItem supports localized aria labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      { totalPages: 10, defaultPage: 5 },
      React.createElement(Pagination.Item, {
        page: 5,
        "aria-label": "Pagina 5",
      }),
    ),
  );

  assert.match(html, /aria-label="Pagina 5"/);
  assert.doesNotMatch(html, /Page 5, current page/);
  assert.match(html, /aria-current="page"/);
});

test("Pagination primitive barrel does not create a client boundary", async () => {
  const controlSource = await readFile(
    new URL("src/primitives/pagination/PaginationControl.tsx", packageRoot),
    "utf8",
  );
  const indexSource = await readFile(
    new URL("src/primitives/pagination/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(controlSource, /\[ctx\]/);
  assert.doesNotMatch(indexSource, /^"use client";/);
});
